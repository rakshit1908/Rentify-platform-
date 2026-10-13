'use strict';

const morgan = require('morgan');
const config = require('../config/env');

// Use concise format in production, verbose in development
const requestLogger = morgan(config.isDev ? 'dev' : 'combined');

module.exports = requestLogger;
