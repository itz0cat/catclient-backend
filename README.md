# CatClient Cloud Backend

> Dedicated lightweight Node.js/Express cloud backend for the [CatClient](https://github.com/itz0cat/CatClient) Fabric 1.21.11 utility mod.

---

## Features

- **Session & Telemetry**: Heartbeat tracking and active session management.
- **In-Game Badges**: Player list batch verification to display client badges above active CatClient users.
- **Cosmetics Engine**: Cloud cape and cosmetic unlocking, equipped cosmetics syncing, and disk persistence.
- **Remote Announcements**: Dynamic Message-of-the-Day (MOTD) and client updates.

---

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health, uptime, and active session counts |
| `POST` | `/api/v1/catclient/session/connect` | Player login & session initiation |
| `POST` | `/api/v1/catclient/session/disconnect` | Player logout & session cleanup |
| `POST` | `/api/v1/catclient/session/heartbeat` | Periodic session keepalive |
| `POST` | `/api/v1/catclient/players` | Batch UUID lookup for CatClient users |
| `GET` | `/api/v1/catclient/user/:uuid` | Player profile & equipped capes |
| `POST` | `/api/v1/catclient/cosmetics/equip` | Equips cosmetic on player profile |
| `GET` | `/api/v1/catclient/motd` | Fetches active MOTD and client version info |
| `POST` | `/api/v1/admin/motd` | *(Admin)* Updates live MOTD |
| `POST` | `/api/v1/admin/cosmetics/grant` | *(Admin)* Grants special cosmetics |

---

## Deployment on Render

This repository includes a `render.yaml` blueprint:

1. Service is deployed at `https://catclient-backend.onrender.com`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Health check path: `/health`

---

## License

MIT License
