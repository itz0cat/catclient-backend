class SessionManager {
  constructor() {
    // Map: uuid -> { username, version, edition, lastSeen: timestamp }
    this.sessions = new Map();
    this.SESSION_TIMEOUT_MS = 2.5 * 60 * 1000; // 2.5 minutes timeout
  }

  connect(uuid, username, version = '1.0.0', edition = 'Fabric-1.21.11') {
    if (!uuid) return null;
    const cleanUuid = uuid.toLowerCase();
    const session = {
      uuid: cleanUuid,
      username: username || 'UnknownPlayer',
      version,
      edition,
      connectedAt: Date.now(),
      lastSeen: Date.now()
    };
    this.sessions.set(cleanUuid, session);
    return session;
  }

  disconnect(uuid) {
    if (!uuid) return false;
    return this.sessions.delete(uuid.toLowerCase());
  }

  heartbeat(uuid) {
    if (!uuid) return false;
    const cleanUuid = uuid.toLowerCase();
    const session = this.sessions.get(cleanUuid);
    if (session) {
      session.lastSeen = Date.now();
      return true;
    }
    return false;
  }

  isOnline(uuid) {
    if (!uuid) return false;
    const cleanUuid = uuid.toLowerCase();
    const session = this.sessions.get(cleanUuid);
    if (!session) return false;

    if (Date.now() - session.lastSeen > this.SESSION_TIMEOUT_MS) {
      this.sessions.delete(cleanUuid);
      return false;
    }
    return true;
  }

  filterActive(uuidList) {
    if (!Array.isArray(uuidList)) return [];
    this.purgeStale();
    return uuidList.filter((u) => u && this.isOnline(u));
  }

  purgeStale() {
    const now = Date.now();
    for (const [uuid, session] of this.sessions.entries()) {
      if (now - session.lastSeen > this.SESSION_TIMEOUT_MS) {
        this.sessions.delete(uuid);
      }
    }
  }

  getActiveSessions() {
    this.purgeStale();
    return Array.from(this.sessions.values());
  }

  getActiveCount() {
    this.purgeStale();
    return this.sessions.size;
  }
}

export const sessionManager = new SessionManager();
