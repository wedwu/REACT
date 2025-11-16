// server.ts
import express from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import basicAuth from 'basic-auth';

const ADMIN_KEY = process.env.ADMIN_KEY || '';
const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASS = process.env.ADMIN_PASS || '';

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

type RideDef = { id: string; name: string; x: number; y: number };
type RideState = RideDef & { uptime: number; isUp: boolean; lastChanged: string; downtimeHistory: { start: string; end: string|null }[] };

const RIDES: RideDef[] = [
  { id: 'space', name: 'Space Mountain', x: 0.62, y: 0.23 },
  { id: 'pirates', name: 'Pirates of the Caribbean', x: 0.32, y: 0.58 },
  { id: 'big-thunder', name: 'Big Thunder Mountain', x: 0.52, y: 0.45 },
  { id: 'haunted', name: 'Haunted Mansion', x: 0.41, y: 0.35 },
  { id: 'tron', name: 'TRON Lightcycle Run', x: 0.74, y: 0.28 },
  { id: 'splash', name: 'Splash Mountain', x: 0.28, y: 0.72 }
];

const rides: RideState[] = RIDES.map(r => ({ ...r, uptime: 99 + Math.random()*1, isUp: true, lastChanged: new Date().toISOString(), downtimeHistory: [] }));

function broadcast(payload: any) {
  const raw = JSON.stringify(payload);
  wss.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(raw); });
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = String(req.headers['x-admin-key'] || '');
  if (ADMIN_KEY && key === ADMIN_KEY) return next();
  if (ADMIN_USER && ADMIN_PASS) {
    const creds = basicAuth(req) || {};
    if ((creds.name || '') === ADMIN_USER && (creds.pass || '') === ADMIN_PASS) return next();
  }
  if (!ADMIN_KEY && !ADMIN_USER && !ADMIN_PASS) { console.warn('WARNING: admin endpoints open (no admin vars set)'); return next(); }
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/rides', (_req, res) => res.json({ rides }));
app.post('/api/admin/toggle/:id', requireAdmin, (req, res) => {
  const id = req.params.id; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  r.isUp = !r.isUp; r.uptime = r.isUp ? 99 + Math.random()*1 : Math.max(0, r.uptime - (5 + Math.random()*30)); r.lastChanged = new Date().toISOString();
  if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null }); else { const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged; }
  broadcast({ type: 'update', rides }); return res.json({ ok: true, r });
});
app.post('/api/admin/set/:id', requireAdmin, (req, res) => {
  const id = req.params.id; const body = req.body || {}; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  if (typeof body.uptime === 'number') r.uptime = Math.max(0, Math.min(100, body.uptime));
  if (typeof body.isUp === 'boolean' && body.isUp !== r.isUp) {
    r.isUp = body.isUp; r.lastChanged = new Date().toISOString();
    if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null }); else { const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged; }
  }
  broadcast({ type: 'update', rides }); return res.json({ ok: true, r });
});
app.get('/api/admin/history/:id', requireAdmin, (req, res) => {
  const r = rides.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  return res.json({ history: r.downtimeHistory });
});

app.use('/', express.static(path.join(__dirname, 'public')));
wss.on('connection', ws => ws.send(JSON.stringify({ type: 'update', rides })));

setInterval(() => {
  rides.forEach(r => {
    if (r.isUp) {
      if (Math.random() < 0.03) {
        r.isUp = false; r.uptime = Math.max(0, r.uptime - (5 + Math.random()*40)); r.lastChanged = new Date().toISOString(); r.downtimeHistory.push({ start: r.lastChanged, end: null });
      } else r.uptime = Math.min(100, r.uptime + Math.random()*0.3);
    } else {
      if (Math.random() < 0.2) { r.isUp = true; r.uptime = 90 + Math.random()*10; r.lastChanged = new Date().toISOString(); const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged; }
      else r.uptime = Math.max(0, r.uptime - Math.random()*1.5);
    }
  });
  broadcast({ type: 'update', rides });
}, 5000);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => console.log(`TS Server listening on http://localhost:${PORT}`));
