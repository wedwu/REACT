import React, { useEffect, useRef, useState } from "react";
import { Ride } from "../types";

type Props = {
  endpoint?: string;
  wsPath?: string;
  size?: number;
};

// --- Utility: Safe requestAnimationFrame loop --------------------------------

function useAnimationFrame(callback: () => void) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const loop = () => {
      if (!mounted) return;
      callback();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [callback]);
}

// ----------------------------------------------------------------------------

export default function DisneyUptimeCanvas({
  endpoint = "/api/rides",
  wsPath = "/",
  size
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // --- Fetch initial data safely -------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const r = await fetch(endpoint, { cache: "no-store" });
        if (!mounted) return;
        const json = await r.json();
        setRides(json.rides ?? []);
      } catch (e) {
        console.error("Failed to load rides", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [endpoint]);

  // --- WebSocket: Strict mode–safe ------------------------------------------
  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const finalURL = wsPath.startsWith("ws")
      ? wsPath
      : `${proto}//${location.host}${wsPath}`;

    let ws: WebSocket | null = new WebSocket(finalURL);

    ws.addEventListener("open", () => setWsConnected(true));
    ws.addEventListener("close", () => setWsConnected(false));
    ws.addEventListener("error", () => setWsConnected(false));

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update" && Array.isArray(data.rides)) {
          setRides(data.rides);
        }
      } catch {}
    });

    return () => {
      try {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
          ws.close();
        }
      } catch {}
      ws = null;
    };
  }, [wsPath]);

  // --- Canvas drawing ------------------------------------------------------
  useAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Scale canvas for high DPI
    if (canvas.width !== w * DPR || canvas.height !== h * DPR) {
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(255,255,255,0.03)");
    bg.addColorStop(1, "rgba(255,255,255,0.00)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (!rides.length) {
      ctx.fillStyle = "#9aa6bd";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading rides...", w / 2, h / 2);
      return;
    }

    // Layout bubbles
    const bubbles = rides.map((r, i) => {
      const radius = 20 + (r.uptime / 100) * 50;

      if (typeof r.x === "number" && typeof r.y === "number") {
        return {
          x: r.x * w,
          y: r.y * h,
          r: radius,
          data: r
        };
      }

      const angle = (i / rides.length) * Math.PI * 2;
      const dist = Math.min(w, h) * 0.3;
      return {
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        r: radius,
        data: r
      };
    });

    // Position relaxation
    for (let iteration = 0; iteration < 30; iteration++) {
      for (let a = 0; a < bubbles.length; a++) {
        for (let b = a + 1; b < bubbles.length; b++) {
          const A = bubbles[a];
          const B = bubbles[b];
          let dx = B.x - A.x;
          let dy = B.y - A.y;
          let dist = Math.hypot(dx, dy) || 0.001;

          const minDist = A.r + B.r + 6;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            A.x -= nx * overlap;
            A.y -= ny * overlap;
            B.x += nx * overlap;
            B.y += ny * overlap;
          }
        }
      }
    }

    // Hover highlight detection
    const bubbleHitTest = (x: number, y: number) => {
      for (const b of bubbles) {
        if (Math.hypot(b.x - x, b.y - y) <= b.r + 8) return b.data.id;
      }
      return null;
    };

    (canvas as any)._hitTest = bubbleHitTest;

    // Draw bubbles
    for (const b of bubbles) {
      const uptime = b.data.uptime;
      const color =
        uptime >= 99 ? "#16a34a" : uptime >= 95 ? "#f59e0b" : "#ef4444";

      // Shadow
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fill();

      // Main ring
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fill();

      // Text
      ctx.textAlign = "center";
      ctx.fillStyle = "#e6eef8";
      ctx.font = "700 14px sans-serif";
      ctx.fillText(`${uptime.toFixed(1)}%`, b.x, b.y - 4);

      ctx.font = "400 12px sans-serif";
      ctx.fillText(b.data.name, b.x, b.y + 14);

      // Hover halo
      if (hovered === b.data.id) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });

  // --- Mouse interaction --------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hit = (canvas as any)._hitTest?.(x, y) ?? null;
      setHovered(hit);
    }

    function onLeave() {
      setHovered(null);
    }

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // --- Resize observer (Strict-Mode-safe) ---------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      const w = size ?? canvas.parentElement?.clientWidth ?? 900;
      const h = Math.round((w * 9) / 16);

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    });

    resizeObserver.observe(canvas);

    return () => {
      try {
        resizeObserver.disconnect();
      } catch {}
    };
  }, [size]);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: size ? `${size}px` : "100%",
          height: size ? `${(size * 9) / 16}px` : "auto",
          borderRadius: 10
        }}
      />
      <div style={{ width: 320 }}>
        <h3 style={{ marginTop: 0 }}>Rides</h3>
        <div style={{ fontSize: 13, opacity: 0.7 }}>
          {wsConnected ? "LIVE" : "OFFLINE"}
        </div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rides.map((r) => (
            <li key={r.id} style={{ marginBottom: 12 }}>
              <strong>{r.name}</strong>
              <br />
              {r.uptime.toFixed(1)}% — {r.isUp ? "UP" : "DOWN"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
