import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const FILE_PATH = path.join(DATA_DIR, 'cosmetics.json');

const DEFAULT_AVAILABLE_CAPES = [
  'cat-blueflame',
  'blaze-red',
  'pastel-aesthetic',
  'animated-astelic',
  'animated-purple-sky',
  'axolotl',
  'glow-squid'
];

class CosmeticsStore {
  constructor() {
    this.userProfiles = new Map();
    this.initStore();
  }

  initStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(FILE_PATH)) {
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        for (const [uuid, profile] of Object.entries(data)) {
          this.userProfiles.set(uuid.toLowerCase(), profile);
        }
      }
    } catch (err) {
      console.warn('[CosmeticsStore] Failed to load disk persistence, using in-memory store:', err.message);
    }
  }

  saveStore() {
    try {
      const obj = {};
      for (const [uuid, profile] of this.userProfiles.entries()) {
        obj[uuid] = profile;
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[CosmeticsStore] Failed to save to disk:', err.message);
    }
  }

  getUser(uuid) {
    if (!uuid) return null;
    const cleanUuid = uuid.toLowerCase();
    if (!this.userProfiles.has(cleanUuid)) {
      // Create default profile for user with all standard capes unlocked
      const profile = {
        uuid: cleanUuid,
        equippedCape: 'cat-blueflame',
        unlockedCapes: [...DEFAULT_AVAILABLE_CAPES],
        badge: 'cat-blueflame',
        verified: true,
        createdAt: Date.now()
      };
      this.userProfiles.set(cleanUuid, profile);
      this.saveStore();
      return profile;
    }
    return this.userProfiles.get(cleanUuid);
  }

  equip(uuid, cosmeticName) {
    if (!uuid || !cosmeticName) return false;
    const profile = this.getUser(uuid);
    profile.equippedCape = cosmeticName;
    if (!profile.unlockedCapes.includes(cosmeticName)) {
      profile.unlockedCapes.push(cosmeticName);
    }
    this.saveStore();
    return true;
  }

  grant(uuid, cosmeticName) {
    if (!uuid || !cosmeticName) return false;
    const profile = this.getUser(uuid);
    if (!profile.unlockedCapes.includes(cosmeticName)) {
      profile.unlockedCapes.push(cosmeticName);
      this.saveStore();
    }
    return true;
  }

  getAvailableCapes() {
    return DEFAULT_AVAILABLE_CAPES;
  }
}

export const cosmeticsStore = new CosmeticsStore();
