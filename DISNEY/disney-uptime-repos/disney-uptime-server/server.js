// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const basicAuth = require('basic-auth');

const ADMIN_KEY = process.env.ADMIN_KEY || ''; // x-admin-key auth
const ADMIN_USER = process.env.ADMIN_USER || ''; // basic auth user
const ADMIN_PASS = process.env.ADMIN_PASS || ''; // basic auth pass

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory ride list with map coordinates
const RIDES = [
  { id: 'space', name: 'Space Mountain', x: 0.62, y: 0.23 },
  { id: 'pirates', name: 'Pirates of the Caribbean', x: 0.32, y: 0.58 },
  { id: 'big-thunder', name: 'Big Thunder Mountain', x: 0.52, y: 0.45 },
  { id: 'haunted', name: 'Haunted Mansion', x: 0.41, y: 0.35 },
  { id: 'tron', name: 'TRON Lightcycle Run', x: 0.74, y: 0.28 },
  { id: 'splash', name: 'Splash Mountain', x: 0.28, y: 0.72 }
];

const rides = RIDES.map(r => ({
  ...r,
  uptime: 99 + Math.random() * 1,
  isUp: true,
  lastChanged: new Date().toISOString(),
  downtimeHistory: []
}));

function broadcast(payload) {
  const raw = JSON.stringify(payload);
  wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(raw); });
}

// Admin auth middleware
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (ADMIN_KEY && key === ADMIN_KEY) return next();

  if (ADMIN_USER && ADMIN_PASS) {
    const creds = basicAuth(req) || {};
    if (creds.name === ADMIN_USER && creds.pass === ADMIN_PASS) return next();
  }

  if (!ADMIN_KEY && !ADMIN_USER && !ADMIN_PASS) {
    console.warn('WARNING: admin endpoints open (no ADMIN_KEY/ADMIN_USER set).');
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).json({ error: 'Unauthorized' });
}

// Public API
app.get('/api/rides', (req, res) => res.json({ rides }));

// Admin endpoints (protected)
app.post('/api/admin/toggle/:id', requireAdmin, (req, res) => {
  const id = req.params.id; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  r.isUp = !r.isUp;
  r.uptime = r.isUp ? 99 + Math.random() * 1 : Math.max(0, r.uptime - (5 + Math.random() * 30));
  r.lastChanged = new Date().toISOString();
  if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null });
  else {
    const last = r.downtimeHistory[r.downtimeHistory.length - 1];
    if (last && !last.end) last.end = r.lastChanged;
  }
  broadcast({ type: 'update', rides });
  res.json({ ok: true, r });
});

app.post('/api/admin/set/:id', requireAdmin, (req, res) => {
  const id = req.params.id; const body = req.body || {}; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  if (typeof body.uptime === 'number') r.uptime = Math.max(0, Math.min(100, body.uptime));
  if (typeof body.isUp === 'boolean' && body.isUp !== r.isUp) {
    r.isUp = body.isUp; r.lastChanged = new Date().toISOString();
    if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null });
    else {
      const last = r.downtimeHistory[r.downtimeHistory.length - 1];
      if (last && !last.end) last.end = r.lastChanged;
    }
  }
  broadcast({ type: 'update', rides });
  res.json({ ok: true, r });
});

app.get('/api/admin/history/:id', requireAdmin, (req, res) => {
  const r = rides.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ history: r.downtimeHistory });
});

// Serve static public (client demo) if present
app.use('/', express.static(path.join(__dirname, 'public')));

// WebSocket connection initial send
wss.on('connection', ws => ws.send(JSON.stringify({ type: 'update', rides })));

// Simulation loop: random outages/recoveries
setInterval(() => {
  rides.forEach(r => {
    if (r.isUp) {
      if (Math.random() < 0.03) {
        r.isUp = false;
        r.uptime = Math.max(0, r.uptime - (5 + Math.random() * 40));
        r.lastChanged = new Date().toISOString();
        r.downtimeHistory.push({ start: r.lastChanged, end: null });
      } else r.uptime = Math.min(100, r.uptime + Math.random() * 0.3);
    } else {
      if (Math.random() < 0.2) {
        r.isUp = true;
        r.uptime = 90 + Math.random() * 10;
        r.lastChanged = new Date().toISOString();
        const last = r.downtimeHistory[r.downtimeHistory.length - 1];
        if (last && !last.end) last.end = r.lastChanged;
      } else {
        r.uptime = Math.max(0, r.uptime - Math.random() * 1.5);
      }
    }
  });
  broadcast({ type: 'update', rides });
}, 5000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
