'use strict';

const { Router } = require('express');
const { sendSuccess } = require('../utils/response');

const router = Router();

/**
 * GET /api/health
 * Basic liveness check.
 */
router.get('/', (req, res) => {
  sendSuccess(res, 200, 'Rentify API is running', {
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;
