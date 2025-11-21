// CanvasLayer.jsx
import { useEffect, useRef } from "react";
import { computeConnectionRoutes } from "../utils/routeEngine";

const CanvasLayer = ({ config, layout }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!layout) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = layout.width || 1400;
    canvas.height = layout.canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const routes = computeConnectionRoutes(config, layout);

    routes.forEach(route => {
      const { start, end, midX, color, isDegraded } = route;

      ctx.strokeStyle = color;
      ctx.lineWidth = isDegraded ? 3 : 2;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(midX, start.y);
      ctx.lineTo(midX, end.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  }, [config, layout]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
};

export default CanvasLayer;
