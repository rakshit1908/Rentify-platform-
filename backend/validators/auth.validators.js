'use strict';

const { body, validationResult } = require('express-validator');

/* ── Reusable field rules ───────────────────────────────── */

const emailField = body('email')
  .trim()
  .notEmpty().withMessage('Email is required.')
  .isEmail().withMessage('Enter a valid email address.')
  .normalizeEmail();

const passwordField = (minLen = 8) =>
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: minLen }).withMessage(`Password must be at least ${minLen} characters.`);

const fullNameField = body('full_name')
  .trim()
  .notEmpty().withMessage('Full name is required.')
  .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters.');

const phoneField = body('phone')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number.');

const roleField = body('role')
  .trim()
  .notEmpty().withMessage('Role is required.')
  .isIn(['renter', 'owner']).withMessage("Role must be 'renter' or 'owner'.");

/* ── Validation rule sets ───────────────────────────────── */

const validateRegister = [
  fullNameField,
  emailField,
  passwordField(8),
  phoneField,
  roleField,
];

const validateLogin = [
  emailField,
  body('password').notEmpty().withMessage('Password is required.'),
];

const validateForgotPassword = [emailField];

const validateResetPassword = [
  passwordField(8),
  body('confirm_password')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((val, { req }) => {
      if (val !== req.body.password) throw new Error('Passwords do not match.');
      return true;
    }),
];

/* ── Middleware: collect errors and respond ─────────────── */

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
};
