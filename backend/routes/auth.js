'use strict';

const { Router } = require('express');
const {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  refreshSession,
} = require('../controllers/auth.controller');

const { verifyToken } = require('../middleware/verifyToken');

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
} = require('../validators/auth.validators');

const router = Router();

// ── Public routes ────────────────────────────────────────
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  register
);

router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  login
);

router.post(
  '/forgot-password',
  validateForgotPassword,
  handleValidationErrors,
  forgotPassword
);

router.post(
  '/reset-password',
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);

router.post('/refresh', refreshSession);

// ── Protected routes (require valid JWT) ─────────────────
router.post('/logout', verifyToken, logout);
router.get('/me',      verifyToken, me);

module.exports = router;
