import { useEffect, useRef } from "react";
import { computeConnectionRoutes } from "../utils/routeEngine";

export default function CanvasLayer({ config, layout }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!layout) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { boxMap } = layout;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute all routes using updated routing engine
    const routes = computeConnectionRoutes(config, layout);

    // ======================================================
    // DRAW CONNECTION LINES
    // ======================================================
    routes.forEach(route => {
      const { start, midX, midY, end, color } = route;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);

      // horizontal from start to elbow column
      ctx.lineTo(midX, start.y);

      // ★ vertical elbow segment (non-overlapping fix)
      ctx.lineTo(midX, midY);

      // vertical down to end level
      ctx.lineTo(midX, end.y);

      // horizontal into destination box
      ctx.lineTo(end.x, end.y);

      ctx.stroke();
    });

    // ======================================================
    // DRAW BOX OUTLINES LAST (so they sit on top of lines)
    // ======================================================
    Object.values(boxMap).forEach(b => {
      ctx.lineWidth = 6;
      ctx.strokeStyle = b.status === "down" ? "#ff5242" : "#4c5e74";
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    });

  }, [config, layout]);

  return (
    <canvas
      ref={canvasRef}
      width={1400}
      height={layout?.canvasHeight || 800}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1
      }}
    />
  );
}
