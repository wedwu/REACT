// src/components/BoxLayer.jsx

import React from "react";

export default function BoxLayer({ cells = [], layoutVariant }) {
  const renderCell = (content) => {
    if (!content) return null; // FIX: Prevent blank renders

    return (
      <div
        style={{
          background: "#1e1d22",
          borderRadius: 6,
          padding: 8,
          minHeight: 100,
          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        {content}
      </div>
    );
  };

  const renderLayoutBody = () => {
    switch (layoutVariant) {
      case "1x1":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>{renderCell(cells[0])}</div>
          </div>
        );

      case "2col-25-right":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 3 }}>{renderCell(cells[0])}</div>
            <div style={{ flex: 1 }}>{renderCell(cells[1])}</div>
          </div>
        );

      case "4col-2row-special":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 3 }}>{renderCell(cells[0])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[1])}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>{renderCell(cells[2])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[3])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[4])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[5])}</div>
            </div>

          </div>
        );

      case "2x2-right-25":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 3 }}>{renderCell(cells[0])}</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ flex: 1 }}>{renderCell(cells[1])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[2])}</div>
            </div>
          </div>
        );

      case "2x2-right-33":
        return (
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 2 }}>{renderCell(cells[0])}</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ flex: 1 }}>{renderCell(cells[1])}</div>
              <div style={{ flex: 1 }}>{renderCell(cells[2])}</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div style={{ width: "100%", height: "100%" }}>{renderLayoutBody()}</div>;
}
