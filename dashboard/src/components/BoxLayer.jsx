// src/components/BoxLayer.jsx
import React from "react";

export default function BoxLayer({ boxMap }) {
  if (!boxMap) return null;

  return (
    <>
      {Object.values(boxMap).map((box) => {
        if (!box.id) return null; // skip metadata keys

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
              border: `4px solid ${
                box.status === "down" ? "#ff5242" : "#4c5e74"
              }`,
              padding: 8,
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
}

// ======================================================
// Render per-box layoutVariant (FULL RESTORED VERSION)
// ======================================================
function renderContent(box) {
  const variant = box.layoutVariant || "1x1";

  switch (variant) {
    // --------------------------------------------------
    case "1x1":
      return (
        <div style={{ width: "100%", height: "100%" }}>
          <h3 style={{ marginTop: 0 }}>{box.id}</h3>
          <p style={{ margin: 0 }}>Status: {box.status}</p>
        </div>
      );

    // --------------------------------------------------
    case "2col-25-right":
      return (
        <div style={{ display: "flex", gap: 8, height: "100%" }}>
          <div style={{ flex: 3 }}>
            <h3 style={{ marginTop: 0 }}>{box.id}</h3>
            <p style={{ margin: 0 }}>Status: {box.status}</p>
          </div>
          <div style={{ flex: 1, background: "#333", borderRadius: 4 }} />
        </div>
      );

    // --------------------------------------------------
    case "4col-2row-special":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 3, background: "#333", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
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
        <div style={{ display: "flex", gap: 8, height: "100%" }}>
          <div style={{ flex: 3, background: "#333", borderRadius: 4 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#555", borderRadius: 4 }} />
          </div>
        </div>
      );

    // --------------------------------------------------
    case "2x2-right-33":
      return (
        <div style={{ display: "flex", gap: 8, height: "100%" }}>
          <div style={{ flex: 2, background: "#333", borderRadius: 4 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ flex: 1, background: "#444", borderRadius: 4 }} />
            <div style={{ flex: 1, background: "#555", borderRadius: 4 }} />
          </div>
        </div>
      );

    // --------------------------------------------------
    default:
      return (
        <div>
          <h3>{box.id}</h3>
          <p>Unknown variant: {variant}</p>
        </div>
      );
  }
}
