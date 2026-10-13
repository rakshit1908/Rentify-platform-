'use strict';

const { supabaseAdmin }          = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/favorites/:propertyId
 * Add a property to favorites. Renter only.
 */
const addFavorite = async (req, res) => {
  try {
    const userId     = req.profile.id;
    const { propertyId } = req.params;

    // Verify property exists and is available
    const { data: property, error: propErr } = await supabaseAdmin
      .from('properties')
      .select('id, status')
      .eq('id', propertyId)
      .single();

    if (propErr || !property) return sendError(res, 404, 'Property not found.');

    // Insert — unique constraint on (user_id, property_id) prevents duplicates
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({ user_id: userId, property_id: propertyId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') // unique_violation
        return sendError(res, 409, 'Property is already in your favorites.');
      return sendError(res, 400, error.message);
    }

    return sendSuccess(res, 201, 'Added to favorites.', { favorite: data });
  } catch (err) {
    console.error('[addFavorite]', err);
    return sendError(res, 500, 'Failed to add favorite.');
  }
};

/**
 * DELETE /api/favorites/:propertyId
 * Remove a property from favorites. Renter only.
 */
const removeFavorite = async (req, res) => {
  try {
    const userId     = req.profile.id;
    const { propertyId } = req.params;

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, 'Removed from favorites.');
  } catch (err) {
    console.error('[removeFavorite]', err);
    return sendError(res, 500, 'Failed to remove favorite.');
  }
};

/**
 * GET /api/favorites
 * Get all favorites for the current user with full property details.
 */
const getFavorites = async (req, res) => {
  try {
    const userId = req.profile.id;

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select(`
        id, created_at,
        properties (
          id, title, property_type, rent, security_deposit,
          bedrooms, bathrooms, area, city, state, status,
          property_images (id, image_url, is_primary)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return sendError(res, 400, error.message);

    // Flatten: include the favoriteId alongside the property
    const favorites = (data || []).map((f) => ({
      favoriteId: f.id,
      savedAt:    f.created_at,
      ...f.properties,
    }));

    return sendSuccess(res, 200, 'Favorites fetched.', { favorites });
  } catch (err) {
    console.error('[getFavorites]', err);
    return sendError(res, 500, 'Failed to fetch favorites.');
  }
};

/**
 * GET /api/favorites/ids
 * Returns only the property IDs the user has favorited.
 * Used by the frontend to show filled hearts on PropertyCards.
 */
const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.profile.id;

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    if (error) return sendError(res, 400, error.message);

    return sendSuccess(res, 200, 'Favorite IDs fetched.', {
      ids: (data || []).map((f) => f.property_id),
    });
  } catch (err) {
    console.error('[getFavoriteIds]', err);
    return sendError(res, 500, 'Failed to fetch favorite IDs.');
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites, getFavoriteIds };
