import { Router } from 'express';
import { sessionManager } from '../services/sessionManager.js';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    service: 'catclient-backend',
    version: '1.0.0',
    targetMod: 'CatClient Fabric 1.21.11',
    uptimeSeconds,
    activeSessions: sessionManager.getActiveCount(),
    timestamp: new Date().toISOString()
  });
});
