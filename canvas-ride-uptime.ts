import React, { useRef, useEffect, useState } from "react";

type Ride = {
  name: string;
  uptime: number;
};

type DisneyUptimeCanvasProps = {
  endpoint: string;
  size?: number;
  bubbleColor?: string;
  textColor?: string;
  pollInterval?: number;
};

export default function DisneyUptimeCanvas({
  endpoint,
  size = 600,
  bubbleColor = "#4da3ff",
  textColor = "#ffffff",
  pollInterval = 30000
}: DisneyUptimeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);

  async function fetchRides() {
    try {
      setError(null);
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Bad response from API");

      const data = await res.json();
      const normalized: Ride[] = (data?.rides || []).map((r: any) => ({
        name: String(r.name || "Unknown Ride"),
        uptime: Number(r.uptime || 0)
      }));
      setRides(normalized);
    } catch (err: any) {
      setError(err.message || "Failed to fetch rides");
    }
  }

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, pollInterval);
    return () => clearInterval(interval);
  }, [endpoint, pollInterval]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, size, size);

    if (!rides.length) {
      ctx.fillStyle = "#fff";
      ctx.font = "20px sans-serif";
      ctx.fillText("No ride data", 20, 40);
      return;
    }

    const maxUptime = Math.max(...rides.map(r => r.uptime));
    const minUptime = Math.min(...rides.map(r => r.uptime));
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    rides.forEach((ride, i) => {
      const angle = (i / rides.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const norm = (ride.uptime - minUptime) / (maxUptime - minUptime || 1);
      const bubbleSize = 20 + norm * 40;

      ctx.beginPath();
      ctx.arc(x, y, bubbleSize, 0, Math.PI * 2);
      ctx.fillStyle = bubbleColor;
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(ride.name, x, y);
    });
  }, [rides, bubbleColor, textColor, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <div className="text-red-400">Error: {error}</div>}
      <canvas ref={canvasRef} />
    </div>
  );
}
