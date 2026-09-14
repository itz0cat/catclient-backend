import { test, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../src/server.js';

let server;
const TEST_PORT = 3199;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, body: json });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

before(() => {
  return new Promise((resolve) => {
    server = app.listen(TEST_PORT, '127.0.0.1', () => resolve());
  });
});

after(() => {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
});

test('GET /health returns 200 and healthy status', async () => {
  const res = await makeRequest('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.strictEqual(res.body.service, 'catclient-backend');
});

test('POST /api/v1/catclient/session/connect registers player', async () => {
  const res = await makeRequest('/api/v1/catclient/session/connect', 'POST', {
    uuid: '11111111-2222-3333-4444-555555555555',
    username: 'TestCatPlayer',
    version: '1.0.0',
    edition: 'Fabric-1.21.11'
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.session.username, 'TestCatPlayer');
});

test('POST /api/v1/catclient/players returns active connected players', async () => {
  const res = await makeRequest('/api/v1/catclient/players', 'POST', {
    players: [
      '11111111-2222-3333-4444-555555555555',
      '00000000-0000-0000-0000-000000000000'
    ]
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.deepStrictEqual(res.body.activeUsers, ['11111111-2222-3333-4444-555555555555']);
});

test('GET /api/v1/catclient/user/:uuid returns player profile & capes', async () => {
  const res = await makeRequest('/api/v1/catclient/user/11111111-2222-3333-4444-555555555555');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.equippedCape, 'cat-blueflame');
  assert.ok(Array.isArray(res.body.unlockedCapes));
});

test('POST /api/v1/catclient/cosmetics/equip equips a new cape', async () => {
  const res = await makeRequest('/api/v1/catclient/cosmetics/equip', 'POST', {
    uuid: '11111111-2222-3333-4444-555555555555',
    cosmetic: 'animated-astelic'
  });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.equipped, 'animated-astelic');

  const check = await makeRequest('/api/v1/catclient/user/11111111-2222-3333-4444-555555555555');
  assert.strictEqual(check.body.equippedCape, 'animated-astelic');
});

test('GET /api/v1/catclient/motd returns live message of the day', async () => {
  const res = await makeRequest('/api/v1/catclient/motd');
  assert.strictEqual(res.status, 200);
  assert.ok(res.body.motd.includes('CatClient'));
});

test('POST /api/v1/catclient/session/disconnect removes active player', async () => {
  const res = await makeRequest('/api/v1/catclient/session/disconnect', 'POST', {
    uuid: '11111111-2222-3333-4444-555555555555'
  });
  assert.strictEqual(res.status, 200);

  const playersRes = await makeRequest('/api/v1/catclient/players', 'POST', {
    players: ['11111111-2222-3333-4444-555555555555']
  });
  assert.deepStrictEqual(playersRes.body.activeUsers, []);
});
