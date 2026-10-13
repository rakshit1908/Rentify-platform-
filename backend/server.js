'use strict';

const app = require('./app');
const config = require('./config/env');

const server = app.listen(config.port, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║        Rentify API — Running         ║');
  console.log(`  ║  Port    : ${config.port}                       ║`);
  console.log(`  ║  Env     : ${config.nodeEnv.padEnd(12)}              ║`);
  console.log(`  ║  Health  : http://localhost:${config.port}/api/health ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled Rejection:', reason);
  process.exit(1);
});
