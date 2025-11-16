# Disney Uptime — Full Local Project

This single document contains a complete local project you can run to test an integrated system that includes:

* Express mock API (JavaScript and TypeScript variants)
* Dynamic outage simulation with downtime history timestamps
* WebSocket streaming (real-time updates)
* Admin panel to manually toggle/adjust ride uptime
* Client React TypeScript app that consumes API and WebSocket, renders the **canvas visualizer + map overlay** with bubble markers

---

## Quick overview / run instructions

1. Create a new folder and initialize npm:

```bash
mkdir disney-uptime-full && cd disney-uptime-full
# copy files from this document into files below
npm init -y
```

2. Install server and client dependencies (we include both JS server and TypeScript server options):

```bash
npm install express cors ws
npm install -D typescript ts-node @types/node @types/express @types/ws
# for client (React + TypeScript) (optional if you want to run client dev)
npx create-react-app client --template typescript
cd client
npm install socket.io-client
# (we will provide client code to paste into the CRA template)
```

3. Run the JS server (simple):

```bash
node server.js
# server listens on http://localhost:4000 and serves client/admin static files
```

Or run the TypeScript server (requires ts-node or compiled output):

```bash
npx ts-node server.ts
```

4. Open the client UI (if using static shipped client) at:

```
http://localhost:4000/
```

Open admin panel:

```
http://localhost:4000/admin.html
```

---

## File: package.json (suggested)

```json
{
  "name": "disney-uptime-full",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "start:ts": "ts-node server.ts",
    "client": "cd client && npm start"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "ws": "^8.13.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/ws": "^8.5.6",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3"
  }
}
```

---

## File: server.js (JavaScript, CommonJS)

```js
// server.js -- JS mock server with WebSocket streaming and admin endpoints
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory ride dataset with coordinates for map overlay
const RIDES = [
  { id: 'space', name: 'Space Mountain', x: 0.62, y: 0.23 },
  { id: 'pirates', name: 'Pirates of the Caribbean', x: 0.32, y: 0.58 },
  { id: 'big-thunder', name: 'Big Thunder Mountain', x: 0.52, y: 0.45 },
  { id: 'haunted', name: 'Haunted Mansion', x: 0.41, y: 0.35 },
  { id: 'tron', name: 'TRON Lightcycle Run', x: 0.74, y: 0.28 },
  { id: 'splash', name: 'Splash Mountain', x: 0.28, y: 0.72 }
];

// Extended state
const rides = RIDES.map(r => ({
  ...r,
  uptime: 99 + Math.random() * 1, // start high
  isUp: true,
  lastChanged: new Date().toISOString(),
  downtimeHistory: [] // array of { start: ISO, end: ISO|null }
}));

function broadcast(payload) {
  const raw = JSON.stringify(payload);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(raw);
  });
}

// API: get rides (returns full state)
app.get('/api/rides', (req, res) => {
  res.json({ rides });
});

// Admin endpoints
app.post('/api/admin/toggle/:id', (req, res) => {
  const id = req.params.id;
  const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  r.isUp = !r.isUp;
  r.uptime = r.isUp ? 99 + Math.random()*1 : Math.max(0, r.uptime - (5+Math.random()*30));
  r.lastChanged = new Date().toISOString();
  if (!r.isUp) {
    // start downtime record
    r.downtimeHistory.push({ start: r.lastChanged, end: null });
  } else {
    // close last downtime
    const last = r.downtimeHistory[r.downtimeHistory.length-1];
    if (last && !last.end) last.end = r.lastChanged;
  }
  broadcast({ type: 'update', rides });
  res.json({ ok: true, r });
});

app.post('/api/admin/set/:id', (req, res) => {
  const id = req.params.id; const body = req.body || {};
  const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  if (typeof body.uptime === 'number') r.uptime = Math.max(0, Math.min(100, body.uptime));
  if (typeof body.isUp === 'boolean' && body.isUp !== r.isUp) {
    r.isUp = body.isUp;
    r.lastChanged = new Date().toISOString();
    if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null });
    else {
      const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged;
    }
  }
  broadcast({ type: 'update', rides });
  res.json({ ok: true, r });
});

// Admin: list downtime history for a ride
app.get('/api/admin/history/:id', (req, res) => {
  const r = rides.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json({ history: r.downtimeHistory });
});

// Serve static client and admin pages (we'll include sample HTML below to paste into project)
app.use('/', express.static(path.join(__dirname, 'public')));

// WebSocket connection
wss.on('connection', ws => {
  // send initial state
  ws.send(JSON.stringify({ type: 'update', rides }));
});

// Simulation: random outages and recoveries
setInterval(() => {
  // choose a couple of rides with small probability to fail/recover
  rides.forEach(r => {
    // if currently up, small chance to fail
    if (r.isUp) {
      if (Math.random() < 0.03) {
        r.isUp = false; r.uptime = Math.max(0, r.uptime - (5 + Math.random()*40));
        r.lastChanged = new Date().toISOString();
        r.downtimeHistory.push({ start: r.lastChanged, end: null });
      } else {
        // slight recovery drift
        r.uptime = Math.min(100, r.uptime + Math.random()*0.3);
      }
    } else {
      // if down, higher chance to recover
      if (Math.random() < 0.2) {
        r.isUp = true; r.uptime = 90 + Math.random()*10; r.lastChanged = new Date().toISOString();
        const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged;
      } else {
        // while down, uptime may remain low
        r.uptime = Math.max(0, r.uptime - Math.random()*1.5);
      }
    }
  });
  broadcast({ type: 'update', rides });
}, 5000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server (JS) listening on http://localhost:${PORT}`));
```

---

## File: server.ts (TypeScript variant)

```ts
// server.ts -- TypeScript version (run via ts-node)
import express from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

type RideDef = { id: string; name: string; x: number; y: number };
const RIDES: RideDef[] = [
  { id: 'space', name: 'Space Mountain', x: 0.62, y: 0.23 },
  { id: 'pirates', name: 'Pirates of the Caribbean', x: 0.32, y: 0.58 },
  { id: 'big-thunder', name: 'Big Thunder Mountain', x: 0.52, y: 0.45 },
  { id: 'haunted', name: 'Haunted Mansion', x: 0.41, y: 0.35 },
  { id: 'tron', name: 'TRON Lightcycle Run', x: 0.74, y: 0.28 },
  { id: 'splash', name: 'Splash Mountain', x: 0.28, y: 0.72 }
];

type RideState = RideDef & {
  uptime: number;
  isUp: boolean;
  lastChanged: string;
  downtimeHistory: { start: string; end: string | null }[];
};

const rides: RideState[] = RIDES.map(r => ({ ...r, uptime: 99 + Math.random()*1, isUp: true, lastChanged: new Date().toISOString(), downtimeHistory: [] }));

function broadcast(payload: any) {
  const raw = JSON.stringify(payload);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(raw);
  });
}

app.get('/api/rides', (_req, res) => res.json({ rides }));

app.post('/api/admin/toggle/:id', (req, res) => {
  const id = req.params.id; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  r.isUp = !r.isUp; r.lastChanged = new Date().toISOString();
  if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null });
  else {
    const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged;
  }
  broadcast({ type: 'update', rides });
  return res.json({ ok: true, r });
});

app.post('/api/admin/set/:id', (req, res) => {
  const id = req.params.id; const body = req.body || {}; const r = rides.find(x => x.id === id);
  if (!r) return res.status(404).json({ error: 'not found' });
  if (typeof body.uptime === 'number') r.uptime = Math.max(0, Math.min(100, body.uptime));
  if (typeof body.isUp === 'boolean' && body.isUp !== r.isUp) {
    r.isUp = body.isUp; r.lastChanged = new Date().toISOString();
    if (!r.isUp) r.downtimeHistory.push({ start: r.lastChanged, end: null });
    else { const last = r.downtimeHistory[r.downtimeHistory.length-1]; if (last && !last.end) last.end = r.lastChanged; }
  }
  broadcast({ type: 'update', rides });
  return res.json({ ok: true, r });
});

app.get('/api/admin/history/:id', (req, res) => {
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
```

---

## File: public/index.html (client single-file demo)

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Disney Ride Uptime – Demo</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #0e1a2b;
      color: white;
      overflow: hidden;
    }
    #mapCanvas {
      position: absolute;
      top: 0;
      left: 0;
    }
    #sidebar {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 100vh;
      background: rgba(0,0,0,0.6);
      padding: 20px;
      overflow-y: auto;
      backdrop-filter: blur(6px);
    }
    .ride {
      margin-bottom: 15px;
      padding: 10px;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <canvas id="mapCanvas"></canvas>
  <div id="sidebar">
    <h2>Ride Uptime</h2>
    <div id="rideList">Loading...</div>
  </div>

  <script>
    const canvas = document.getElementById("mapCanvas");
    const ctx = canvas.getContext("2d");
    const rideList = document.getElementById("rideList");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let rides = [];

    const socket = new WebSocket("ws://localhost:4000");

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      rides = data.rides;
      renderRideList();
    });

    function renderRideList() {
      rideList.innerHTML = "";
      rides.forEach(ride => {
        const div = document.createElement("div");
        div.className = "ride";
        div.innerHTML = `
          <strong>${ride.name}</strong><br>
          Uptime: ${ride.uptime}%<br>
          Status: ${ride.status}<br>
          Downtime History:<br>
          <ul>${ride.history.map(h => `<li>${new Date(h).toLocaleTimeString()}</li>`).join("")}</ul>
        `;
        rideList.appendChild(div);
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rides.forEach((ride, idx) => {
        const x = canvas.width * (0.2 + 0.15 * idx);
        const y = canvas.height * (0.5 + (Math.sin(idx + performance.now() / 2000) * 0.1));

        const size = 30 + ride.uptime * 0.5;
        const color = ride.status === "down" ? "red" : "lime";

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "14px sans-serif";
        ctx.fillText(ride.name, x - size, y - (size + 10));
      });

      requestAnimationFrame(draw);
    }

    draw();
  </script>
</body>
</html>
``` (client single-file demo)

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Disney Uptime — Demo Client</title>
  <style>
    body{font-family:Inter,Arial;background:#07101a;color:#e6eef8;margin:0;padding:18px}
    header{display:flex;align-items:center;gap:12px}
    #mapWrap{width:100%;max-width:1100px;margin-top:18px}
    #map{position:relative;width:100%;height:520px;background:#0b1220;border-radius:14px;overflow:hidden}
    #map img{width:100%;height:100%;object-fit:cover;opacity:0.18}
    .marker{position:absolute;transform:translate(-50%,-50%);cursor:pointer}
    .legend{margin-top:12px;display:flex;gap:10px}
  </style>
</head>
<body>
  <header>
    <h1>Disney Rides Uptime — Live</h1>
    <div style="margin-left:auto">WS: <span id="wsState">—</span></div>
  </header>
  <div id="mapWrap">
    <div id="map">
      <!-- Optional park map image; place a file at public/park.jpg or keep blank -->
      <img src="park.jpg" alt="park" onerror="this.style.display='none'">
    </div>
  </div>
  <div class="legend" id="legend"></div>

  <script>
  const wsState = document.getElementById('wsState');
  const map = document.getElementById('map');
  const legend = document.getElementById('legend');

  function colorFor(u) { return u>=99 ? '#16a34a' : (u>=95 ? '#f59e0b' : '#ef4444'); }

  function renderMarkers(rides) {
    map.innerHTML = map.querySelector('img') ? map.querySelector('img').outerHTML : '';
    rides.forEach(r => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.left = (r.x*100) + '%';
      el.style.top = (r.y*100) + '%';
      el.style.width = Math.max(20, Math.min(100, 12 + (r.uptime))) + 'px';
      el.style.height = el.style.width;
      el.style.borderRadius = '50%';
      el.style.background = colorFor(r.uptime);
      el.title = `${r.name} — ${r.uptime.toFixed(1)}%`;
      el.addEventListener('click', ()=> alert(JSON.stringify(r, null, 2)));
      map.appendChild(el);
    });

    legend.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center"><div style="width:12px;height:12px;background:#16a34a;border-radius:6px"></div> ≥ 99%</div>
      <div style="display:flex;gap:8px;align-items:center"><div style="width:12px;height:12px;background:#f59e0b;border-radius:6px"></div> 95–99%</div>
      <div style="display:flex;gap:8px;align-items:center"><div style="width:12px;height:12px;background:#ef4444;border-radius:6px"></div> &lt; 95%</div>
    `;
  }

  // Fetch initial via REST, then subscribe to WS
  fetch('/api/rides').then(r=>r.json()).then(d=>{ renderMarkers(d.rides); });

  const protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
  const ws = new WebSocket(protocol + '//' + location.host);
  ws.addEventListener('open', ()=> wsState.textContent = 'open');
  ws.addEventListener('close', ()=> wsState.textContent = 'closed');
  ws.addEventListener('error', ()=> wsState.textContent = 'error');
  ws.addEventListener('message', (m)=>{
    try {
      const payload = JSON.parse(m.data);
      if (payload.type === 'update' && Array.isArray(payload.rides)) renderMarkers(payload.rides);
    } catch(e){console.error('ws parse', e)}
  });

  </script>
</body>
</html>
````

---

## File: public/admin.html (Admin panel)

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin — Disney Uptime</title>
  <style>body{font-family:Arial,Helvetica,sans-serif;padding:18px;background:#07101a;color:#e6eef8} table{width:100%;border-collapse:collapse} td,th{padding:8px;border-bottom:1px solid rgba(255,255,255,0.03)}</style>
</head>
<body>
  <h1>Admin — Control Rides</h1>
  <p>Toggle ride up/down or set uptime. Connected clients will update instantly via WebSocket.</p>
  <div id="list">Loading...</div>
  <script>
    async function fetchList(){
      const res = await fetch('/api/rides'); const data = await res.json();
      const rows = data.rides.map(r=>`<tr>
        <td>${r.name}</td>
        <td>${r.uptime.toFixed(1)}%</td>
        <td>${r.isUp? 'UP': 'DOWN'}</td>
        <td><button onclick="toggle('${r.id}')">Toggle</button></td>
        <td><button onclick="history('${r.id}')">History</button></td>
      </tr>`).join('');
      document.getElementById('list').innerHTML = `<table><thead><tr><th>Ride</th><th>Uptime</th><th>State</th><th>Toggle</th><th>History</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
    async function toggle(id){ await fetch('/api/admin/toggle/'+id, { method:'POST' }); fetchList(); }
    async function history(id){ const r=await fetch('/api/admin/history/'+id).then(r=>r.json()); alert(JSON.stringify(r.history, null, 2)); }
    fetchList();
    const socket = new WebSocket((location.protocol==='https:'?'wss:':'ws:')+'//'+location.host);
    socket.addEventListener('message', ()=> fetchList());
  </script>
</body>
</html>
```

---

## Client: React TypeScript integration notes

If you created a CRA TypeScript client (`npx create-react-app client --template typescript`) you can paste the earlier **DisneyUptimeCanvas** TypeScript component into `src/components/DisneyUptimeCanvas.tsx` and in `src/App.tsx` wire it like:

```tsx
import React from 'react';
import DisneyUptimeCanvas from './components/DisneyUptimeCanvas';

function App(){
  return <div style={{padding:20}}>
    <DisneyUptimeCanvas endpoint="/api/rides" size={720} />
  </div>
}
export default App;
```

When running CRA locally in dev mode, start the server (port 4000) and the CRA dev server (3000); configure proxy in `client/package.json`:

```json
"proxy": "http://localhost:4000"
```

This lets `/api` calls go to the Express server.

---

## Notes, security, and next steps

* This is a local mock/test environment. Do **not** expose it as-is to the public internet without authentication and SSRF protections.
* The downtime history is stored in-memory only. Restarting the server will reset it.
* You can extend the simulation rates, add more rides and coordinates, and replace `public/park.jpg` with a real park map.
* If you want, I can deploy this as a single Docker Compose stack with client + server containers and instructions.

---

If you'd like I can now:

* Provide the full CRA `src` files (component + App + index) ready to paste into a fresh `create-react-app client --template typescript`.
* Create a `Dockerfile` and `docker-compose.yml`.
* Add authentication for admin endpoints.

Which one next?"
