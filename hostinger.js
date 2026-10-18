import app from './index.js';
import { PORT } from './config.js';

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Hostinger API listening on port ${PORT}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
