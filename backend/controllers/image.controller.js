'use strict';

const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

const BUCKET        = 'property-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;       // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/* ── Helpers ────────────────────────────────────────────── */

/** Build the storage path: {owner_id}/{property_id}/{uuid}.{ext} */
const buildStoragePath = (ownerId, propertyId, mimetype) => {
  const ext = mimetype.split('/')[1].replace('jpeg', 'jpg');
  return `${ownerId}/${propertyId}/${uuidv4()}.${ext}`;
};

/** Verify the property exists and belongs to the owner */
const assertOwnership = async (propertyId, ownerId) => {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .single();
  if (error || !data) return { ok: false, status: 404, message: 'Property not found.' };
  if (data.owner_id !== ownerId)
    return { ok: false, status: 403, message: 'You do not own this property.' };
  return { ok: true };
};

/* ── Controllers ────────────────────────────────────────── */

/**
 * POST /api/properties/:id/images
 * Upload one or more images for a property.
 * Accepts multipart/form-data with field name "images".
 */
const uploadImages = async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const ownerId = req.profile.id;

    const check = await assertOwnership(propertyId, ownerId);
    if (!check.ok) return sendError(res, check.status, check.message);

    if (!req.files || !req.files.length) {
      return sendError(res, 400, 'No images provided.');
    }

    // Validate each file
    for (const file of req.files) {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return sendError(res, 415, `Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, WEBP.`);
      }
      if (file.size > MAX_FILE_SIZE) {
        return sendError(res, 413, `File "${file.originalname}" exceeds the 5 MB size limit.`);
      }
    }

    // Check how many images already exist
    const { data: existingImages } = await supabaseAdmin
      .from('property_images')
      .select('id, is_primary')
      .eq('property_id', propertyId);

    const existingCount = existingImages?.length || 0;
    if (existingCount + req.files.length > 10) {
      return sendError(res, 400, `A property can have at most 10 images. Currently has ${existingCount}.`);
    }

    const uploaded = [];
    const errors   = [];

    for (const file of req.files) {
      const storagePath = buildStoragePath(ownerId, propertyId, file.mimetype);

      // Upload to Supabase Storage using admin client (bypasses storage RLS)
      const { error: uploadErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, file.buffer, {
          contentType:  file.mimetype,
          cacheControl: '3600',
          upsert:       false,
        });

      if (uploadErr) {
        errors.push({ file: file.originalname, error: uploadErr.message });
        continue;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(storagePath);

      // Determine if this should be the primary image
      const isPrimary = existingCount === 0 && uploaded.length === 0;

      // Save metadata to DB
      const { data: imageRecord, error: dbErr } = await supabaseAdmin
        .from('property_images')
        .insert({
          property_id:  propertyId,
          image_url:    publicUrl,
          storage_path: storagePath,
          is_primary:   isPrimary,
        })
        .select()
        .single();

      if (dbErr) {
        // Rollback storage upload
        await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
        errors.push({ file: file.originalname, error: dbErr.message });
        continue;
      }

      uploaded.push(imageRecord);
    }

    if (!uploaded.length) {
      return sendError(res, 500, 'All uploads failed.', errors);
    }

    return sendSuccess(res, 201, `${uploaded.length} image(s) uploaded successfully.`, {
      images: uploaded,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error('[uploadImages] unexpected:', err);
    return sendError(res, 500, 'Image upload failed.');
  }
};

/**
 * DELETE /api/properties/:id/images/:imageId
 * Delete a single image. Owner only.
 */
const deleteImage = async (req, res) => {
  try {
    const { id: propertyId, imageId } = req.params;
    const ownerId = req.profile.id;

    const check = await assertOwnership(propertyId, ownerId);
    if (!check.ok) return sendError(res, check.status, check.message);

    const { data: image, error: fetchErr } = await supabaseAdmin
      .from('property_images')
      .select('id, storage_path, is_primary')
      .eq('id', imageId)
      .eq('property_id', propertyId)
      .single();

    if (fetchErr || !image) return sendError(res, 404, 'Image not found.');

    // Delete from storage
    if (image.storage_path) {
      await supabaseAdmin.storage.from(BUCKET).remove([image.storage_path]);
    }

    // Delete from DB
    await supabaseAdmin.from('property_images').delete().eq('id', imageId);

    // If deleted image was primary, promote the next image
    if (image.is_primary) {
      const { data: remaining } = await supabaseAdmin
        .from('property_images')
        .select('id')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (remaining?.length) {
        await supabaseAdmin
          .from('property_images')
          .update({ is_primary: true })
          .eq('id', remaining[0].id);
      }
    }

    return sendSuccess(res, 200, 'Image deleted successfully.');
  } catch (err) {
    console.error('[deleteImage] unexpected:', err);
    return sendError(res, 500, 'Failed to delete image.');
  }
};

/**
 * PATCH /api/properties/:id/images/:imageId/primary
 * Set an image as the primary image. Owner only.
 */
const setPrimaryImage = async (req, res) => {
  try {
    const { id: propertyId, imageId } = req.params;
    const ownerId = req.profile.id;

    const check = await assertOwnership(propertyId, ownerId);
    if (!check.ok) return sendError(res, check.status, check.message);

    // Verify image belongs to this property
    const { data: image, error: fetchErr } = await supabaseAdmin
      .from('property_images')
      .select('id')
      .eq('id', imageId)
      .eq('property_id', propertyId)
      .single();

    if (fetchErr || !image) return sendError(res, 404, 'Image not found.');

    // Unset current primary
    await supabaseAdmin
      .from('property_images')
      .update({ is_primary: false })
      .eq('property_id', propertyId);

    // Set new primary
    await supabaseAdmin
      .from('property_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    return sendSuccess(res, 200, 'Primary image updated.');
  } catch (err) {
    console.error('[setPrimaryImage] unexpected:', err);
    return sendError(res, 500, 'Failed to update primary image.');
  }
};

module.exports = { uploadImages, deleteImage, setPrimaryImage };
