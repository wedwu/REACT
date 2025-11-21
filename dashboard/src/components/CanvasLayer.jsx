// CanvasLayer.jsx
import { useEffect, useRef } from "react";
import { computeConnectionRoutes } from "../utils/routeEngine";

const CanvasLayer = ({ config, layout }) => {
  const canvasRef = useRef(null);
  const iconLayerRef = useRef(null);

  useEffect(() => {
    if (!layout) return;

    const canvas = canvasRef.current;
    const iconLayer = iconLayerRef.current;

    if (!canvas || !iconLayer) return;

    const ctx = canvas.getContext("2d");
    const iconCtx = iconLayer.getContext("2d");

    canvas.width = layout.width || 1400;
    canvas.height = layout.canvasHeight;
    iconLayer.width = layout.width || 1400;
    iconLayer.height = layout.canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    iconCtx.clearRect(0, 0, iconLayer.width, iconLayer.height);

    // Fetch routed paths + icon coordinates
    const routes = computeConnectionRoutes(config, layout);

    // ======================================================
    // DRAW ALL ROUTES
    // ======================================================
    routes.forEach(route => {
      const { start, midX, end, color } = route;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      ctx.moveTo(start.x, start.y);
      ctx.lineTo(midX, start.y);
      ctx.lineTo(midX, end.y);
      ctx.lineTo(end.x, end.y);

      ctx.stroke();

      // ======================================================
      // DRAW ELBOW ICONS (from routeEngine)
      // ======================================================
      if (route.isDegraded && Array.isArray(route.elbowIcons)) {
        route.elbowIcons.forEach(pt => {
          drawElbowIcon(iconCtx, pt.x, pt.y);
        });
      }
    });
  }, [config, layout]);

  // ======================================================
  // Paint a single warning icon on the icon canvas
  // ======================================================
  function drawElbowIcon(ctx, x, y) {
    const radius = 10;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff5242";
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ff5242";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "15px sans-serif bolder";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", x, y + 1);
  }

  return (
    <>
      {/* LINE LAYER */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* ICON LAYER */}
      <canvas
        ref={iconLayerRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 2,
          pointerEvents: "none"
        }}
      />
    </>
  );
};

export default CanvasLayer;
