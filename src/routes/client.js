import { Router } from 'express';
import { sessionManager } from '../services/sessionManager.js';
import { cosmeticsStore } from '../services/cosmeticsStore.js';

export const clientRouter = Router();

let currentMotd = 'CatClient 1.21.11 | Blue Flame Edition';
let currentAnnouncement = 'CatClient 1.21.11 online.';

// Session Connect
clientRouter.post('/session/connect', (req, res) => {
  const { uuid, username, version, edition } = req.body || {};
  if (!uuid) {
    return res.status(400).json({ error: 'UUID is required' });
  }

  const session = sessionManager.connect(uuid, username, version, edition);
  res.json({
    success: true,
    session,
    motd: currentMotd,
    theme: 'blue-flame'
  });
});

// Session Disconnect
clientRouter.post('/session/disconnect', (req, res) => {
  const { uuid } = req.body || {};
  if (uuid) {
    sessionManager.disconnect(uuid);
  }
  res.json({ success: true });
});

// Session Heartbeat
clientRouter.post('/session/heartbeat', (req, res) => {
  const { uuid } = req.body || {};
  if (uuid) {
    sessionManager.heartbeat(uuid);
  }
  res.json({ success: true });
});

// Batch Player Active Verification (for in-game nametag badge)
clientRouter.post('/players', (req, res) => {
  const { players } = req.body || {};
  const list = Array.isArray(players) ? players : [];
  const activeUsers = sessionManager.filterActive(list);

  res.json({
    success: true,
    activeUsers
  });
});

// Get User Profile & Cosmetics
clientRouter.get('/user/:uuid', (req, res) => {
  const { uuid } = req.params;
  const profile = cosmeticsStore.getUser(uuid);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  res.json(profile);
});

// Equip Cosmetic
clientRouter.post('/cosmetics/equip', (req, res) => {
  const { uuid, cosmetic } = req.body || {};
  if (!uuid || !cosmetic) {
    return res.status(400).json({ error: 'uuid and cosmetic name are required' });
  }

  const success = cosmeticsStore.equip(uuid, cosmetic);
  res.json({
    success,
    equipped: cosmetic
  });
});

// Get Live MOTD
clientRouter.get('/motd', (req, res) => {
  res.json({
    motd: currentMotd,
    announcement: currentAnnouncement,
    version: '1.0.0',
    edition: 'Fabric-1.21.11',
    theme: 'blue-flame'
  });
});

export function setMotd(motd, announcement) {
  if (motd) currentMotd = motd;
  if (announcement) currentAnnouncement = announcement;
}

export function getMotd() {
  return { motd: currentMotd, announcement: currentAnnouncement };
}
