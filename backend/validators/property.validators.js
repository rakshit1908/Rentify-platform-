'use strict';

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./auth.validators');

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'studio', 'pg', 'commercial', 'plot'];
const STATUSES       = ['available', 'rented'];

/* ── Field rules ────────────────────────────────────────── */

const titleField = body('title')
  .trim()
  .notEmpty().withMessage('Title is required.')
  .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters.');

const propertyTypeField = body('property_type')
  .trim()
  .notEmpty().withMessage('Property type is required.')
  .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}.`);

const rentField = body('rent')
  .notEmpty().withMessage('Rent is required.')
  .isFloat({ min: 1 }).withMessage('Rent must be a positive number.');

const securityDepositField = body('security_deposit')
  .optional({ checkFalsy: true })
  .isFloat({ min: 0 }).withMessage('Security deposit must be zero or a positive number.');

const bedroomsField = body('bedrooms')
  .optional({ checkFalsy: true })
  .isInt({ min: 0, max: 20 }).withMessage('Bedrooms must be between 0 and 20.');

const bathroomsField = body('bathrooms')
  .optional({ checkFalsy: true })
  .isInt({ min: 0, max: 20 }).withMessage('Bathrooms must be between 0 and 20.');

const areaField = body('area')
  .optional({ checkFalsy: true })
  .isFloat({ min: 1 }).withMessage('Area must be a positive number.');

const addressField = body('address')
  .trim()
  .notEmpty().withMessage('Address is required.')
  .isLength({ max: 500 }).withMessage('Address is too long.');

const cityField = body('city')
  .trim()
  .notEmpty().withMessage('City is required.')
  .isLength({ max: 100 }).withMessage('City name is too long.');

const stateField = body('state')
  .trim()
  .notEmpty().withMessage('State is required.')
  .isLength({ max: 100 }).withMessage('State name is too long.');

const pincodeField = body('pincode')
  .trim()
  .notEmpty().withMessage('Pincode is required.')
  .matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits.');

const latField = body('latitude')
  .optional({ checkFalsy: true })
  .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90.');

const lngField = body('longitude')
  .optional({ checkFalsy: true })
  .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180.');

const statusField = body('status')
  .trim()
  .notEmpty().withMessage('Status is required.')
  .isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}.`);

const amenitiesField = body('amenities')
  .optional()
  .isArray().withMessage('Amenities must be an array.');

/* ── Validation rule sets ───────────────────────────────── */

const validateCreateProperty = [
  titleField,
  propertyTypeField,
  rentField,
  securityDepositField,
  bedroomsField,
  bathroomsField,
  areaField,
  addressField,
  cityField,
  stateField,
  pincodeField,
  latField,
  lngField,
  amenitiesField,
];

const validateUpdateProperty = [
  body('title').optional().trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters.'),
  body('property_type').optional().trim()
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}.`),
  body('rent').optional()
    .isFloat({ min: 1 }).withMessage('Rent must be a positive number.'),
  securityDepositField,
  bedroomsField,
  bathroomsField,
  areaField,
  body('address').optional().trim().isLength({ max: 500 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('pincode').optional().trim().matches(/^\d{6}$/).withMessage('Pincode must be exactly 6 digits.'),
  latField,
  lngField,
  amenitiesField,
];

const validateStatusUpdate = [statusField];

const validateUUID = (paramName = 'id') =>
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID.`);

module.exports = {
  validateCreateProperty,
  validateUpdateProperty,
  validateStatusUpdate,
  validateUUID,
  handleValidationErrors,
};
