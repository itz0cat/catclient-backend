import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clientRouter } from './routes/client.js';
import { healthRouter } from './routes/health.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Root overview
app.get('/', (req, res) => {
  res.json({
    service: 'catclient-backend',
    description: 'Dedicated Cloud Backend for CatClient Fabric 1.21.11 Mod',
    theme: 'blue-flame',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      connect: 'POST /api/v1/catclient/session/connect',
      disconnect: 'POST /api/v1/catclient/session/disconnect',
      heartbeat: 'POST /api/v1/catclient/session/heartbeat',
      players: 'POST /api/v1/catclient/players',
      user: 'GET /api/v1/catclient/user/:uuid',
      equip: 'POST /api/v1/catclient/cosmetics/equip',
      motd: 'GET /api/v1/catclient/motd'
    }
  });
});

// Mount modular sub-routers
app.use('/health', healthRouter);
app.use('/api/v1/catclient', clientRouter);
app.use('/api/v1/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on CatClient Backend' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[CatClient-Backend Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[CatClient-Backend] Server listening on http://${HOST}:${PORT}`);
  console.log(`[CatClient-Backend] Health check available at http://${HOST}:${PORT}/health`);
});

const shutdown = (signal) => {
  console.log(`[CatClient-Backend] Received ${signal}, closing server...`);
  server.close(() => {
    console.log('[CatClient-Backend] Server terminated cleanly.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
