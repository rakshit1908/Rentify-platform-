'use strict';

const { sendError } = require('../utils/response');
const config = require('../config/env');

/**
 * 404 – route not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler — must be registered last.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Only expose stack traces in development
  const detail = config.isDev ? err.stack : undefined;

  console.error(`[ERROR] ${statusCode} — ${message}`);
  if (detail) console.error(detail);

  return sendError(res, statusCode, message, detail ? { stack: detail } : null);
};

module.exports = { notFound, errorHandler };
