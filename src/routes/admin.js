import { Router } from 'express';
import { sessionManager } from '../services/sessionManager.js';
import { cosmeticsStore } from '../services/cosmeticsStore.js';
import { setMotd, getMotd } from './client.js';

export const adminRouter = Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'catclient-secret-2026';

// Auth middleware for admin endpoints
adminRouter.use((req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const keyHeader = req.headers['x-admin-key'] || req.query.key;

  if (token === ADMIN_SECRET || keyHeader === ADMIN_SECRET) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
});

// View all live connected sessions
adminRouter.get('/sessions', (req, res) => {
  res.json({
    count: sessionManager.getActiveCount(),
    sessions: sessionManager.getActiveSessions()
  });
});

// Update live MOTD and announcements
adminRouter.post('/motd', (req, res) => {
  const { motd, announcement } = req.body || {};
  setMotd(motd, announcement);
  res.json({
    success: true,
    ...getMotd()
  });
});

// Grant special cape to player
adminRouter.post('/cosmetics/grant', (req, res) => {
  const { uuid, cosmetic } = req.body || {};
  if (!uuid || !cosmetic) {
    return res.status(400).json({ error: 'uuid and cosmetic are required' });
  }

  cosmeticsStore.grant(uuid, cosmetic);
  res.json({
    success: true,
    profile: cosmeticsStore.getUser(uuid)
  });
});
