'use strict';

const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

/* ── Helpers ────────────────────────────────────────────── */

/** Fetch amenity rows for a property and return as array of {id,name} */
const getPropertyAmenities = async (propertyId) => {
  const { data } = await supabaseAdmin
    .from('property_amenities')
    .select('amenity_id, amenities(id, name)')
    .eq('property_id', propertyId);
  return (data || []).map((r) => r.amenities).filter(Boolean);
};

/** Fetch images for a property */
const getPropertyImages = async (propertyId) => {
  const { data } = await supabaseAdmin
    .from('property_images')
    .select('id, image_url, storage_path, is_primary, created_at')
    .eq('property_id', propertyId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });
  return data || [];
};

/** Sync amenities for a property — replace all */
const syncAmenities = async (propertyId, amenityIds = []) => {
  // Remove existing
  await supabaseAdmin
    .from('property_amenities')
    .delete()
    .eq('property_id', propertyId);

  if (!amenityIds.length) return;

  // Validate IDs exist
  const { data: valid } = await supabaseAdmin
    .from('amenities')
    .select('id')
    .in('id', amenityIds);

  const validIds = (valid || []).map((a) => a.id);
  if (!validIds.length) return;

  await supabaseAdmin.from('property_amenities').insert(
    validIds.map((aid) => ({ property_id: propertyId, amenity_id: aid }))
  );
};

/* ── Controllers ────────────────────────────────────────── */

/**
 * POST /api/properties
 * Create a new property. Owner only.
 */
const createProperty = async (req, res) => {
  try {
    const ownerId = req.profile.id;
    const {
      title, description, property_type, rent, security_deposit,
      bedrooms, bathrooms, area,
      address, city, state, pincode, latitude, longitude,
      amenities = [],
    } = req.body;

    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .insert({
        owner_id:         ownerId,
        title:            title.trim(),
        description:      description?.trim() || null,
        property_type,
        rent:             parseFloat(rent),
        security_deposit: parseFloat(security_deposit || 0),
        bedrooms:         bedrooms != null ? parseInt(bedrooms) : null,
        bathrooms:        bathrooms != null ? parseInt(bathrooms) : null,
        area:             area != null ? parseFloat(area) : null,
        address:          address.trim(),
        city:             city.trim(),
        state:            state.trim(),
        pincode:          pincode.trim(),
        latitude:         latitude != null ? parseFloat(latitude) : null,
        longitude:        longitude != null ? parseFloat(longitude) : null,
        status:           'available',
      })
      .select()
      .single();

    if (error) {
      console.error('[createProperty]', error);
      return sendError(res, 400, error.message);
    }

    // Sync amenities
    if (amenities.length) await syncAmenities(property.id, amenities);

    return sendSuccess(res, 201, 'Property created successfully.', { property });
  } catch (err) {
    console.error('[createProperty] unexpected:', err);
    return sendError(res, 500, 'Failed to create property.');
  }
};

/**
 * GET /api/properties
 * Public — returns available properties with filters.
 */
const getProperties = async (req, res) => {
  try {
    const {
      city, search, property_type,
      min_rent, max_rent,
      bedrooms, bathrooms,
      amenities,           // comma-separated amenity IDs
      sort = 'newest',
      page = 1, limit = 12,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(50, parseInt(limit) || 12);
    const offset   = (pageNum - 1) * limitNum;

    // Sort mapping
    const sortMap = {
      newest:     { col: 'created_at', asc: false },
      rent_asc:   { col: 'rent',       asc: true  },
      rent_desc:  { col: 'rent',       asc: false },
    };
    const { col: sortCol, asc: sortAsc } = sortMap[sort] || sortMap.newest;

    let q = supabaseAdmin
      .from('properties')
      .select(`
        id, title, description, property_type, rent, security_deposit,
        bedrooms, bathrooms, area, address, city, state, pincode,
        latitude, longitude, status, created_at,
        profiles!owner_id(id, full_name, avatar_url),
        property_images(id, image_url, is_primary)
      `, { count: 'exact' })
      .eq('status', 'available')
      .order(sortCol, { ascending: sortAsc })
      .range(offset, offset + limitNum - 1);

    // Filters
    if (city)          q = q.ilike('city', `%${city}%`);
    if (property_type) q = q.eq('property_type', property_type);
    if (min_rent)      q = q.gte('rent', parseFloat(min_rent));
    if (max_rent)      q = q.lte('rent', parseFloat(max_rent));
    if (bedrooms)      q = q.eq('bedrooms', parseInt(bedrooms));
    if (bathrooms)     q = q.eq('bathrooms', parseInt(bathrooms));

    // Full-text search on title + address + city
    if (search && search.trim()) {
      const term = search.trim();
      q = q.or(`title.ilike.%${term}%,address.ilike.%${term}%,city.ilike.%${term}%`);
    }

    const { data, error, count } = await q;
    if (error) return sendError(res, 400, error.message);

    let properties = data || [];

    // Amenity filter — post-process (junction table not easily filterable in one query)
    if (amenities) {
      const amenityIds = amenities.split(',').filter(Boolean);
      if (amenityIds.length) {
        // Fetch property IDs that have ALL requested amenities
        const { data: paRows } = await supabaseAdmin
          .from('property_amenities')
          .select('property_id, amenity_id')
          .in('amenity_id', amenityIds);

        if (paRows?.length) {
          // Group by property_id and keep only those with ALL amenities
          const grouped = {};
          for (const row of paRows) {
            grouped[row.property_id] = grouped[row.property_id] || new Set();
            grouped[row.property_id].add(row.amenity_id);
          }
          const matching = Object.entries(grouped)
            .filter(([, ids]) => amenityIds.every((id) => ids.has(id)))
            .map(([pid]) => pid);

          properties = properties.filter((p) => matching.includes(p.id));
        } else {
          properties = [];
        }
      }
    }

    return sendSuccess(res, 200, 'Properties fetched.', {
      properties,
      pagination: {
        total: count || 0,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (err) {
    console.error('[getProperties] unexpected:', err);
    return sendError(res, 500, 'Failed to fetch properties.');
  }
};

/**
 * GET /api/properties/my-properties
 * Returns all properties for the authenticated owner.
 */
const getMyProperties = async (req, res) => {
  try {
    const ownerId = req.profile.id;

    const { data, error } = await supabaseAdmin
      .from('properties')
      .select(`
        id, title, property_type, rent, bedrooms, bathrooms,
        area, city, state, status, created_at, updated_at,
        property_images(id, image_url, is_primary)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, 'Properties fetched.', { properties: data || [] });
  } catch (err) {
    console.error('[getMyProperties] unexpected:', err);
    return sendError(res, 500, 'Failed to fetch your properties.');
  }
};

/**
 * GET /api/properties/:id
 * Public — single property with all details.
 */
const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select(`
        id, title, description, property_type, rent, security_deposit,
        bedrooms, bathrooms, area, address, city, state, pincode,
        latitude, longitude, status, created_at, updated_at,
        profiles!owner_id(id, full_name, avatar_url, phone)
      `)
      .eq('id', id)
      .single();

    if (error || !property) return sendError(res, 404, 'Property not found.');

    // Fetch images and amenities separately for full detail
    const [images, amenities] = await Promise.all([
      getPropertyImages(id),
      getPropertyAmenities(id),
    ]);

    return sendSuccess(res, 200, 'Property fetched.', {
      property: { ...property, images, amenities },
    });
  } catch (err) {
    console.error('[getPropertyById] unexpected:', err);
    return sendError(res, 500, 'Failed to fetch property.');
  }
};

/**
 * PUT /api/properties/:id
 * Update a property. Owner only — must own the property.
 */
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.profile.id;

    // Verify ownership before update
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return sendError(res, 404, 'Property not found.');
    if (existing.owner_id !== ownerId)
      return sendError(res, 403, 'You do not have permission to edit this property.');

    const {
      title, description, property_type, rent, security_deposit,
      bedrooms, bathrooms, area, address, city, state, pincode,
      latitude, longitude, amenities,
    } = req.body;

    // Build update object — only include provided fields
    const updates = {};
    if (title          != null) updates.title            = title.trim();
    if (description    != null) updates.description      = description.trim() || null;
    if (property_type  != null) updates.property_type    = property_type;
    if (rent           != null) updates.rent             = parseFloat(rent);
    if (security_deposit != null) updates.security_deposit = parseFloat(security_deposit);
    if (bedrooms       != null) updates.bedrooms         = parseInt(bedrooms);
    if (bathrooms      != null) updates.bathrooms        = parseInt(bathrooms);
    if (area           != null) updates.area             = parseFloat(area);
    if (address        != null) updates.address          = address.trim();
    if (city           != null) updates.city             = city.trim();
    if (state          != null) updates.state            = state.trim();
    if (pincode        != null) updates.pincode          = pincode.trim();
    if (latitude       != null) updates.latitude         = parseFloat(latitude);
    if (longitude      != null) updates.longitude        = parseFloat(longitude);

    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) return sendError(res, 400, error.message);

    // Sync amenities if provided
    if (Array.isArray(amenities)) await syncAmenities(id, amenities);

    return sendSuccess(res, 200, 'Property updated successfully.', { property });
  } catch (err) {
    console.error('[updateProperty] unexpected:', err);
    return sendError(res, 500, 'Failed to update property.');
  }
};

/**
 * DELETE /api/properties/:id
 * Delete a property. Owner only.
 */
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.profile.id;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return sendError(res, 404, 'Property not found.');
    if (existing.owner_id !== ownerId)
      return sendError(res, 403, 'You do not have permission to delete this property.');

    // Fetch storage paths before delete (cascade will remove DB rows)
    const { data: images } = await supabaseAdmin
      .from('property_images')
      .select('storage_path')
      .eq('property_id', id);

    // Delete property (cascades to property_images, property_amenities, favorites, inquiries)
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) return sendError(res, 400, error.message);

    // Delete storage files (best-effort — don't fail the request if this errors)
    if (images?.length) {
      const paths = images.map((img) => img.storage_path).filter(Boolean);
      if (paths.length) {
        await supabaseAdmin.storage.from('property-images').remove(paths);
      }
    }

    return sendSuccess(res, 200, 'Property deleted successfully.');
  } catch (err) {
    console.error('[deleteProperty] unexpected:', err);
    return sendError(res, 500, 'Failed to delete property.');
  }
};

/**
 * PATCH /api/properties/:id/status
 * Change property status. Owner only.
 */
const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.profile.id;
    const { status } = req.body;

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, status')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return sendError(res, 404, 'Property not found.');
    if (existing.owner_id !== ownerId)
      return sendError(res, 403, 'You do not have permission to update this property.');

    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .update({ status })
      .eq('id', id)
      .select('id, status, updated_at')
      .single();

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, `Property marked as ${status}.`, { property });
  } catch (err) {
    console.error('[updatePropertyStatus] unexpected:', err);
    return sendError(res, 500, 'Failed to update property status.');
  }
};

/**
 * GET /api/properties/amenities
 * Public — returns the full amenities list for the form.
 */
const getAmenities = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('amenities')
      .select('id, name')
      .order('name');

    if (error) return sendError(res, 400, error.message);
    return sendSuccess(res, 200, 'Amenities fetched.', { amenities: data || [] });
  } catch (err) {
    console.error('[getAmenities] unexpected:', err);
    return sendError(res, 500, 'Failed to fetch amenities.');
  }
};

module.exports = {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getAmenities,
};
