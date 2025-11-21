// src/components/BoxLayer.jsx
import React from "react";

const BoxLayer = ({ boxMap }) => {
  if (!boxMap) return null;

  return (
    <>
      {Object.values(boxMap).map((box) => {
        if (!box.id) return null;

        return (
          <div
            key={box.id}
            className="dynamic-box"
            style={{
              position: "absolute",
              left: box.x,
              top: box.y,
              width: box.w,
              height: box.h,
              // border: `4px solid ${
              //   box.status === "down" ? "#ff5242" : "#4c5e74"
              // }`,
              border: 0,
              // padding: 8,
              boxSizing: "border-box",
              overflow: "hidden",
              zIndex: 20,
              background: "#1e1d22",
              borderRadius: 6,
            }}
          >
            {renderContent(box)}
          </div>
        );
      })}
    </>
  );
};

// ======================================================
// Top Header
// ======================================================
const TopHeader = ({ box }) => {
  const canvasRef = React.useRef(null);

  const chartValues = Array.isArray(box.chartValues)
    ? box.chartValues
    : [2, 4, 6, 3, 5, 7, 4];

  const accentColor = box.status === "down" ? "#ff5242" : "#4c5e74" // "rgb(76, 94, 116)"; // line stroke
  const accentSoft = box.status === "down" ? "#ff5242" : "#4c5e74" // "rgb(76, 94, 116)"; // fill

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const data = chartValues.length > 0 ? chartValues : [0];

    const max = Math.max(...data, 0);
    const min = Math.min(...data, 0);
    const range = max - min || 1;

    const toY = (value) => {
      const normalized = (value - min) / range;
      return h - normalized * h;
    };

    ctx.beginPath();
    ctx.moveTo(0, h);

    const stepX = data.length > 1 ? w / (data.length - 1) : w;

    data.forEach((v, idx) => {
      const x = idx * stepX;
      const y = toY(v);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(w, h);
    ctx.closePath();

    ctx.fillStyle = accentSoft;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, idx) => {
      const x = idx * stepX;
      const y = toY(v);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [chartValues]);

  return (
    <div
      style={{
        width: "100%",
        background: "transparent",
        // borderBottom: "1px solid #444",
        // borderRadius: "4px 4px 0 0",
      }}
    >
      <canvas
        ref={canvasRef}
        width={260}
        height={40}
        style={{
          width: "100%",
          height: 32,
        }}
      />
    </div>
  );
};

// ======================================================
// Layout Variants
// ======================================================
function renderContent(box) {
  const variant = box.layoutVariant || "1x1";

  switch (variant) {
    // --------------------------------------------------
    case "1x1":
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <TopHeader box={box} />
          <div style={{ padding: 4 }}>
            <p style={{ margin: 0 }}>Simple Layout</p>
          </div>
        </div>
      );

    // --------------------------------------------------
    case "2col-25-right":
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <TopHeader box={box} />

          <div style={{ display: "flex", gap: 0, flex: 1, border: `8px solid ${box.status === "down" ? "#ff5242" : "#4c5e74"}` }}>
            <div style={{ flex: 3 }}>
              <h3 style={{ marginTop: 0 }}>{box.name}</h3>
              <p style={{ margin: 0 }}>Address: {box.address}</p>
              <p style={{ margin: 0 }}>Status: {box.status}</p>
            </div>
            <div style={{ flex: 1, background: "#333", borderRadius: 4 }} />
          </div>
        </div>
      );

    // --------------------------------------------------
    case "4col-2row-special":
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <TopHeader box={box} />

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 3, background: "#333", borderRadius: 4 }}>
              <h3 style={{ marginTop: 0 }}>{box.name}</h3>
              <p style={{ margin: 0 }}>Address: {box.address}</p>
            </div>
            <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, background: "#3b3b3b", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#494949", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#555", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#666", borderRadius: 4 }} />
          </div>
        </div>
      );

    // --------------------------------------------------
    case "2x2-right-25":
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <TopHeader box={box} />

          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            <div style={{ flex: 3, background: "#333", borderRadius: 4 }} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
              <div style={{ flex: 1, background: "#555", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      );

    // --------------------------------------------------
    case "2x2-right-33":
      return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <TopHeader box={box} />

          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            <div style={{ flex: 2, background: "#333", borderRadius: 4 }} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
              <div style={{ flex: 1, background: "#555", borderRadius: 4 }} />
            </div>
          </div>
        </div>
      );

    // --------------------------------------------------
    default:
      return (
        <div style={{ width: "100%" }}>
          <TopHeader box={box} />
          <p>Unknown variant: {variant}</p>
        </div>
      );
  }
}

export default BoxLayer;
