'use strict';

const { Router } = require('express');
const { addFavorite, removeFavorite, getFavorites, getFavoriteIds } = require('../controllers/favorites.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { validateUUID, handleValidationErrors } = require('../validators/property.validators');

const router = Router();

// All favorites routes require authentication
router.use(verifyToken);

router.get('/',    getFavorites);
router.get('/ids', getFavoriteIds);

router.post(
  '/:propertyId',
  validateUUID('propertyId'),
  handleValidationErrors,
  addFavorite
);

router.delete(
  '/:propertyId',
  validateUUID('propertyId'),
  handleValidationErrors,
  removeFavorite
);

module.exports = router;
