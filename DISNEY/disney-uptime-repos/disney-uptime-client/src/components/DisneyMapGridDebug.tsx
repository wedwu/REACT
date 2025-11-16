import React, { useRef, useState } from "react";

type Props = {
  backgroundImage?: string; // e.g. "/park-map.svg"
};

type Coords = { x: number; y: number };

const format = (v: number) => v.toFixed(3);

export default function DisneyMapGridDebug({
  backgroundImage = "/park-map.svg"
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<Coords | null>(null);
  const [lastClick, setLastClick] = useState<Coords | null>(null);

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // clamp between 0 and 1
    const nx = Math.min(1, Math.max(0, x));
    const ny = Math.min(1, Math.max(0, y));
    setHover({ x: nx, y: ny });
  };

  const handleLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    setHover(null);
  };

  const handleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    if (!hover) return;
    setLastClick(hover);
    // Also log to console as a JSON snippet
    console.log(
      `Clicked coordinate: { "x": ${format(hover.x)}, "y": ${format(
        hover.y
      )} }`
    );
  };

  // Generate grid lines at 0.0, 0.1, ..., 1.0
  const ticks = Array.from({ length: 11 }, (_, i) => i / 10);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* Map + grid */}
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 500,
          borderRadius: 16,
          overflow: "hidden",
          background: "#020617",
          boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
          cursor: "crosshair",
          userSelect: "none"
        }}
      >
        {/* Background map */}
        <img
          src={backgroundImage}
          alt="Debug park map"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.35,
            pointerEvents: "none"
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Grid overlay */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}
        >
          {/* Vertical lines */}
          {ticks.map((t) => (
            <g key={`v-${t}`}>
              <line
                x1={t * 1000}
                y1={0}
                x2={t * 1000}
                y2={1000}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth={t === 0 || t === 1 ? 2 : 1}
                strokeDasharray={t === 0 || t === 1 ? "" : "6 6"}
              />
              {/* X labels (top) */}
              <text
                x={t * 1000}
                y={20}
                fill="#e5e7eb"
                textAnchor="middle"
                fontSize="24"
                fontFamily="system-ui, sans-serif"
              >
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Horizontal lines */}
          {ticks.map((t) => (
            <g key={`h-${t}`}>
              <line
                x1={0}
                y1={t * 1000}
                x2={1000}
                y2={t * 1000}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth={t === 0 || t === 1 ? 2 : 1}
                strokeDasharray={t === 0 || t === 1 ? "" : "6 6"}
              />
              {/* Y labels (left) */}
              <text
                x={22}
                y={t * 1000 - 6}
                fill="#e5e7eb"
                textAnchor="start"
                fontSize="24"
                fontFamily="system-ui, sans-serif"
              >
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Crosshair for hover */}
          {hover && (
            <>
              <line
                x1={hover.x * 1000}
                y1={0}
                x2={hover.x * 1000}
                y2={1000}
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <line
                x1={0}
                y1={hover.y * 1000}
                x2={1000}
                y2={hover.y * 1000}
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              <circle
                cx={hover.x * 1000}
                cy={hover.y * 1000}
                r={8}
                fill="#f97316"
                stroke="#0f172a"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>

      {/* Side panel with live coordinates & JSON snippet */}
      <div
        style={{
          width: 340,
          padding: 16,
          borderRadius: 16,
          background: "rgba(15,23,42,0.98)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.9)",
          color: "#e5e7eb",
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <h3 style={{ margin: 0 }}>Grid Debug Mode</h3>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Hover over the map to see <code>x</code> and <code>y</code> in
          normalized coordinates (0 → left/top, 1 → right/bottom).
          Click to capture a position and get a ready-to-paste JSON snippet for
          <code>rides.json</code>.
        </p>

        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: "rgba(30,64,175,0.35)",
            border: "1px solid rgba(59,130,246,0.6)"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Current hover</div>
          {hover ? (
            <div>
              x:&nbsp;<code>{format(hover.x)}</code> &nbsp; y:&nbsp;
              <code>{format(hover.y)}</code>
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>Move cursor over the map…</div>
          )}
        </div>

        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(75,85,99,0.9)"
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Last clicked position
          </div>
          {lastClick ? (
            <>
              <div style={{ marginBottom: 6 }}>
                x:&nbsp;<code>{format(lastClick.x)}</code> &nbsp; y:&nbsp;
                <code>{format(lastClick.y)}</code>
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>
                Example <code>rides.json</code> entry:
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 8,
                  borderRadius: 8,
                  background: "#020617",
                  fontSize: 12,
                  overflowX: "auto"
                }}
              >
{`{
  "id": "new-ride-id",
  "name": "New Ride Name",
  "uptime": 98.5,
  "isUp": true,
  "x": ${format(lastClick.x)},
  "y": ${format(lastClick.y)}
}`}
              </pre>
              <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>
                Also logged to <code>console.log</code> when you click.
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.75 }}>
              Click on the map to capture a coordinate.
            </div>
          )}
        </div>

        <div style={{ marginTop: "auto", fontSize: 11, opacity: 0.65 }}>
          Tip: use this mode to dial in <code>x</code> and <code>y</code> for
          each ride, then paste them into <code>public/rides.json</code>.
        </div>
      </div>
    </div>
  );
}
