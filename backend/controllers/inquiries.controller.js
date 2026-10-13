'use strict';

const { supabaseAdmin }          = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

const VALID_STATUSES = ['pending', 'contacted', 'closed'];

/**
 * POST /api/inquiries
 * Renter creates an inquiry for a property.
 */
const createInquiry = async (req, res) => {
  try {
    const renterId = req.profile.id;
    const { property_id, message, phone } = req.body;

    if (!property_id) return sendError(res, 422, 'Property ID is required.');
    if (!message?.trim()) return sendError(res, 422, 'Message is required.');

    // Fetch property to get owner_id and validate existence
    const { data: property, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('id, owner_id, status, title')
      .eq('id', property_id)
      .single();

    if (propErr || !property) return sendError(res, 404, 'Property not found.');
    if (property.status !== 'available')
      return sendError(res, 400, 'This property is not available for enquiries.');
    if (property.owner_id === renterId)
      return sendError(res, 400, 'You cannot send an inquiry for your own property.');

    const { data: inquiry, error } = await supabaseAdmin
      .from('inquiries')
      .insert({
        property_id,
        renter_id:  renterId,
        owner_id:   property.owner_id,
        message:    message.trim(),
        phone:      phone?.trim() || null,
        status:     'pending',
      })
      .select(`
        id, message, phone, status, created_at,
        properties (id, title, city, state, property_images(id, image_url, is_primary))
      `)
      .single();

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 201, 'Inquiry sent successfully.', { inquiry });
  } catch (err) {
    console.error('[createInquiry]', err);
    return sendError(res, 500, 'Failed to send inquiry.');
  }
};

/**
 * GET /api/inquiries/my
 * Renter views their own inquiries.
 */
const getMyInquiries = async (req, res) => {
  try {
    const renterId = req.profile.id;

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select(`
        id, message, phone, status, created_at, updated_at,
        properties (
          id, title, city, state, rent,
          property_images (id, image_url, is_primary)
        ),
        owner:profiles!owner_id (id, full_name, avatar_url)
      `)
      .eq('renter_id', renterId)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, 'Inquiries fetched.', { inquiries: data || [] });
  } catch (err) {
    console.error('[getMyInquiries]', err);
    return sendError(res, 500, 'Failed to fetch inquiries.');
  }
};

/**
 * GET /api/inquiries/owner
 * Owner views inquiries for all their properties.
 */
const getOwnerInquiries = async (req, res) => {
  try {
    const ownerId = req.profile.id;
    const { status, property_id } = req.query;

    let q = supabaseAdmin
      .from('inquiries')
      .select(`
        id, message, phone, status, created_at, updated_at,
        properties (id, title, city, state, rent,
          property_images (id, image_url, is_primary)
        ),
        renter:profiles!renter_id (id, full_name, avatar_url)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (status && VALID_STATUSES.includes(status)) q = q.eq('status', status);
    if (property_id) q = q.eq('property_id', property_id);

    const { data, error } = await q;
    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, 'Inquiries fetched.', { inquiries: data || [] });
  } catch (err) {
    console.error('[getOwnerInquiries]', err);
    return sendError(res, 500, 'Failed to fetch inquiries.');
  }
};

/**
 * PATCH /api/inquiries/:id/status
 * Owner updates inquiry status.
 */
const updateInquiryStatus = async (req, res) => {
  try {
    const ownerId = req.profile.id;
    const { id }  = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status))
      return sendError(res, 422, `Status must be one of: ${VALID_STATUSES.join(', ')}.`);

    // Verify this inquiry belongs to the owner
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('inquiries')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchErr || !existing) return sendError(res, 404, 'Inquiry not found.');
    if (existing.owner_id !== ownerId)
      return sendError(res, 403, 'You do not have permission to update this inquiry.');

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select('id, status, updated_at')
      .single();

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, `Inquiry marked as ${status}.`, { inquiry: data });
  } catch (err) {
    console.error('[updateInquiryStatus]', err);
    return sendError(res, 500, 'Failed to update inquiry.');
  }
};

/**
 * GET /api/inquiries/stats
 * Returns inquiry counts for the authenticated owner.
 */
const getInquiryStats = async (req, res) => {
  try {
    const ownerId = req.profile.id;

    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('status')
      .eq('owner_id', ownerId);

    if (error) return sendError(res, 400, error.message);

    const total    = (data || []).length;
    const pending  = (data || []).filter((i) => i.status === 'pending').length;
    const contacted = (data || []).filter((i) => i.status === 'contacted').length;
    const closed   = (data || []).filter((i) => i.status === 'closed').length;

    return sendSuccess(res, 200, 'Stats fetched.', { total, pending, contacted, closed });
  } catch (err) {
    console.error('[getInquiryStats]', err);
    return sendError(res, 500, 'Failed to fetch stats.');
  }
};

module.exports = {
  createInquiry,
  getMyInquiries,
  getOwnerInquiries,
  updateInquiryStatus,
  getInquiryStats,
};
