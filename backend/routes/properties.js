'use strict';

const { Router } = require('express');
const multer     = require('multer');

const {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getAmenities,
} = require('../controllers/property.controller');

const {
  uploadImages,
  deleteImage,
  setPrimaryImage,
} = require('../controllers/image.controller');

const { verifyToken, requireRole } = require('../middleware/verifyToken');

const {
  validateCreateProperty,
  validateUpdateProperty,
  validateStatusUpdate,
  validateUUID,
  handleValidationErrors,
} = require('../validators/property.validators');

const router = Router();

// Multer: store files in memory so we can stream to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize:  5 * 1024 * 1024,  // 5 MB per file
    files:     10,                // max 10 files per request
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

// ── Public routes ────────────────────────────────────────
router.get('/',             getProperties);
router.get('/amenities',    getAmenities);

// ── Protected — any authenticated user ──────────────────
// NOTE: /my-properties MUST come before /:id to avoid UUID conflict
router.get(
  '/my-properties',
  verifyToken,
  requireRole('owner'),
  getMyProperties
);

router.get(
  '/:id',
  validateUUID('id'),
  handleValidationErrors,
  getPropertyById
);

// ── Protected — owner only ───────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('owner'),
  validateCreateProperty,
  handleValidationErrors,
  createProperty
);

router.put(
  '/:id',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  validateUpdateProperty,
  handleValidationErrors,
  updateProperty
);

router.delete(
  '/:id',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  handleValidationErrors,
  deleteProperty
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  validateStatusUpdate,
  handleValidationErrors,
  updatePropertyStatus
);

// ── Image routes ─────────────────────────────────────────
router.post(
  '/:id/images',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  handleValidationErrors,
  upload.array('images', 10),
  uploadImages
);

router.delete(
  '/:id/images/:imageId',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  validateUUID('imageId'),
  handleValidationErrors,
  deleteImage
);

router.patch(
  '/:id/images/:imageId/primary',
  verifyToken,
  requireRole('owner'),
  validateUUID('id'),
  validateUUID('imageId'),
  handleValidationErrors,
  setPrimaryImage
);

module.exports = router;
