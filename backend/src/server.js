const app = require('./app');
const config = require('./config/env');
const { initDriver, closeDriver } = require('./config/db');

const PORT = config.port;

initDriver();

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

async function handleShutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(async () => {
    await closeDriver();
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
