import React, { useRef, useEffect, useState } from "react";

// React component: <DisneyUptimeCanvas endpoint="/api/rides" size={600} />
// Props:
//   endpoint: URL to fetch ride uptime data
//   size: width/height of the canvas (number)
//   bubbleColor: optional override for bubble fill color
//   textColor: optional override for label color
//   pollInterval: optional polling interval in seconds (default: 30)
// API expected format: [{ id, name, uptime (0-100), lastChecked?, notes? }]

export default function DisneyUptimeCanvas({
  endpoint,
  size = 600,
  bubbleColor = "#4da3ff",
  textColor = "#ffffff",
  pollInterval = 30,
}) {
  const canvasRef = useRef(null);
  const [rides, setRides] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [error, setError] = useState(null);

  // Normalize incoming items
  function normalize(item) {
    return {
      id: item.id ?? item.name ?? Math.random().toString(36).slice(2),
      name: String(item.name ?? "Unnamed"),
      uptime: Math.max(0, Math.min(100, Number(item.uptime) || 0)),
      lastChecked: item.lastChecked ?? null,
      notes: item.notes ?? "",
    };
  }

  // Fetch data
  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!endpoint) return;
      try {
        setError(null);
        const r = await fetch(endpoint, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error("Expected an array response");
        if (!mounted) return;
        setRides(data.map(normalize));
      } catch (e) {
        console.error("Failed to fetch rides", e);
        if (mounted) {
          setError(String(e.message || e));
          setRides([]);
        }
      }
    }

    fetchData();
    const iv = setInterval(fetchData, Math.max(5, Number(pollInterval) || 30) * 1000);
    return () => { mounted = false; clearInterval(iv); };
  }, [endpoint, pollInterval]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // handle device pixel ratio
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    function resize() {
      const logical = size;
      canvas.width = Math.floor(logical * DPR);
      canvas.height = Math.floor(logical * DPR);
      canvas.style.width = logical + "px";
      canvas.style.height = logical + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function wrapText(ctx, text, maxWidth, maxLines) {
      const words = String(text).split(/\s+/);
      const lines = [];
      let cur = "";
      for (let w of words) {
        const test = cur ? (cur + " " + w) : w;
        const m = ctx.measureText(test).width;
        if (m > maxWidth && cur) {
          lines.push(cur); cur = w;
          if (lines.length >= maxLines) break;
        } else cur = test;
      }
      if (cur && lines.length < maxLines) lines.push(cur);
      return lines;
    }

    function draw() {
      const w = size;
      const h = size;
      ctx.clearRect(0, 0, w, h);

      // subtle background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "rgba(255,255,255,0.02)");
      bg.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

      if (!rides || rides.length === 0) {
        ctx.fillStyle = textColor;
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(error ? `Error: ${error}` : "No ride data", w/2, h/2);
        return;
      }

      const cx = w / 2;
      const cy = h / 2;
      const maxRadius = Math.min(w, h) * 0.35;

      // compute radii and initial positions on a spiral
      const bubbles = rides.map((ride, i) => {
        const r = Math.max(12, maxRadius * (ride.uptime / 100));
        const angle = (i / rides.length) * Math.PI * 2;
        const dist = 30 + i * (Math.min(w, h) * 0.035);
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist * 0.8;
        return { x, y, r, data: ride };
      });

      // simple relaxation to reduce overlaps
      for (let iter=0; iter<48; iter++){
        let moved = false;
        for (let a=0;a<bubbles.length;a++){
          for (let b=a+1;b<bubbles.length;b++){
            const A=bubbles[a], B=bubbles[b];
            let dx = B.x - A.x, dy = B.y - A.y;
            let dist = Math.hypot(dx, dy) || 0.001;
            const minDist = A.r + B.r + 6;
            if (dist < minDist){
              const overlap = (minDist - dist)/2;
              const nx = dx/dist, ny = dy/dist;
              A.x -= nx*overlap; A.y -= ny*overlap;
              B.x += nx*overlap; B.y += ny*overlap;
              moved = true;
            }
          }
        }
        if (!moved) break;
      }

      // draw bubbles
      bubbles.forEach((b, i)=>{
        const uptime = b.data.uptime;
        const status = uptime >= 99 ? 'good' : (uptime >= 95 ? 'warn' : 'bad');
        const color = status === 'good' ? '#16a34a' : (status === 'warn' ? '#f59e0b' : '#ef4444');

        // shadow
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6, 0, Math.PI*2); ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();

        // outer ring
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2); ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.stroke();

        // uptime arc
        const start = -Math.PI/2;
        const end = start + (Math.PI*2) * (uptime/100);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 8, start, end, false);
        ctx.lineWidth = 8; ctx.strokeStyle = color; ctx.stroke();

        // percentage
        ctx.fillStyle = textColor; ctx.font = '600 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(uptime.toFixed(1) + '%', b.x, b.y - 4);

        // name (wrapped)
        ctx.fillStyle = textColor; ctx.font = '400 12px sans-serif';
        const nameLines = wrapText(ctx, b.data.name, b.r * 1.6, 2);
        nameLines.forEach((ln, idx)=> ctx.fillText(ln, b.x, b.y + 14 + idx*14));

        // highlight hover
        if (hovered === b.data.id) {
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI*2); ctx.closePath();
          ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2; ctx.stroke();
        }
      });

      // store bubbles on canvas for hit-testing
      canvas._bubbles = bubbles;
    }

    resize();
    draw();
    const onResize = () => { resize(); draw(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rides, hovered, size, bubbleColor, textColor, error]);

  // mouse move / click handlers
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const bubbles = canvas._bubbles || [];
    let found = null;
    for (let i=0;i<bubbles.length;i++){
      const b = bubbles[i];
      const d = Math.hypot(b.x - x, b.y - y);
      if (d <= b.r + 6) { found = b.data.id; break; }
    }
    setHovered(found);
  };

  const handleClick = (e) => {
    // toggle pinned behavior: clicking pins/unpins
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const bubbles = canvas._bubbles || [];
    for (let i=0;i<bubbles.length;i++){
      const b = bubbles[i];
      const d = Math.hypot(b.x - x, b.y - y);
      if (d <= b.r + 6) {
        setHovered(prev => (prev === b.data.id ? null : b.data.id));
        break;
      }
    }
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{borderRadius:12,boxShadow:'0 10px 30px rgba(2,6,23,0.6)'}}
      />

      {hovered && (() => {
        const r = rides.find(x => x.id === hovered);
        if (!r) return null;
        return (
          <div style={{padding:12,background:'#111827',color:textColor,borderRadius:10,boxShadow:'0 6px 20px rgba(0,0,0,0.6)'}}>
            <div style={{fontWeight:700,fontSize:16}}>{r.name}</div>
            <div>Uptime: {r.uptime}%</div>
            {r.lastChecked && <div>Last checked: {new Date(r.lastChecked).toLocaleString()}</div>}
            {r.notes && <div style={{opacity:0.85}}>{r.notes}</div>}
          </div>
        );
      })()}

    </div>
  );
}
