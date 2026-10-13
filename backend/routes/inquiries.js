'use strict';

const { Router } = require('express');
const {
  createInquiry, getMyInquiries, getOwnerInquiries,
  updateInquiryStatus, getInquiryStats,
} = require('../controllers/inquiries.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');
const { validateUUID, handleValidationErrors } = require('../validators/property.validators');

const router = Router();

router.use(verifyToken);

// Renter routes
router.post('/',    requireRole('renter'), createInquiry);
router.get('/my',   getMyInquiries);

// Owner routes
router.get('/owner', requireRole('owner'), getOwnerInquiries);
router.get('/stats', requireRole('owner'), getInquiryStats);

router.patch(
  '/:id/status',
  requireRole('owner'),
  validateUUID('id'),
  handleValidationErrors,
  updateInquiryStatus
);

module.exports = router;
