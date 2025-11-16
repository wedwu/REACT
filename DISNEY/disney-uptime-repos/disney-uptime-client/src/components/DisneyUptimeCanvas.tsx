import React, { useEffect, useRef, useState } from "react";
import { Ride } from "../types";

// ---------------------------------------------------------------------------
// LOCAL JSON VERSION — NO SERVER, NO WEBSOCKET
// Loads /public/rides.json and renders bubbles
// ---------------------------------------------------------------------------

type Props = {
  jsonPath?: string;
  size?: number;
};

// Local animation hook
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
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [callback]);
}

// ---------------------------------------------------------------------------

export default function DisneyUptimeCanvas({
  jsonPath = "/rides.json",
  size
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);

  // --- Load local JSON ----------------------------------------------------
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(jsonPath, { cache: "no-store" });
        const json = await res.json();
        if (!mounted) return;
        setRides(json.rides || []);
      } catch (err) {
        console.error("Failed to load local rides.json", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [jsonPath]);

  // --- Draw on canvas -----------------------------------------------------
  useAnimationFrame(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * DPR || canvas.height !== h * DPR) {
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    ctx.clearRect(0, 0, w, h);

    if (!rides.length) {
      ctx.fillStyle = "#9aa6bd";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading rides.json…", w / 2, h / 2);
      return;
    }

    const bubbles = rides.map((r, i) => {
      const radius = 20 + (r.uptime / 100) * 50;

      return {
        x: (r.x ?? 0.5) * w,
        y: (r.y ?? 0.5) * h,
        r: radius,
        data: r
      };
    });

    // Simple collision resolution
    for (let iter = 0; iter < 20; iter++) {
      for (let a = 0; a < bubbles.length; a++) {
        for (let b = a + 1; b < bubbles.length; b++) {
          const A = bubbles[a];
          const B = bubbles[b];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const dist = Math.hypot(dx, dy) || 0.001;
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

    (canvas as any)._hitTest = (x: number, y: number) => {
      for (const b of bubbles) {
        if (Math.hypot(b.x - x, b.y - y) <= b.r + 8) return b.data.id;
      }
      return null;
    };

    for (const b of bubbles) {
      const uptime = b.data.uptime;
      const color =
        uptime >= 99 ? "#16a34a" : uptime >= 95 ? "#f59e0b" : "#ef4444";

      // Glow
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

      if (hovered === b.data.id) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });

  // --- Hover handling -------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const hit = (canvas as any)._hitTest?.(x, y) || null;
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

  // --- Resize observer -----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const w = size ?? canvas.parentElement?.clientWidth ?? 900;
      const h = Math.round((w * 9) / 16);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();

    const obs = new ResizeObserver(resize);
    obs.observe(canvas);

    return () => obs.disconnect();
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
      <div style={{ width: 300 }}>
        <h3>Local Ride Uptime</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rides.map((r) => (
            <li key={r.id} style={{ marginBottom: 12 }}>
              <strong>{r.name}</strong>
              <br />
              {r.uptime}% — {r.isUp ? "UP" : "DOWN"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
