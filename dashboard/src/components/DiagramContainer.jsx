// src/components/DiagramContainer.jsx

import React, { useMemo } from "react";
import CanvasLayer from "./CanvasLayer";
import BoxLayer from "./BoxLayer";
import ElbowIcons from "./ElbowIcons";

import { calculateLayout } from "../utils/layoutEngine";
import { diagramConfig } from "../config/diagramConfig";

export default function DiagramContainer({ layoutVariant }) {

  const layout = useMemo(() => {
    return calculateLayout(diagramConfig, 1400);
  }, []);

  // FIX: Build cells directly from diagramConfig, not layout
  const cells = diagramConfig.columns.flatMap(col =>
    col.boxes.map((box) => (
      <div key={box.id} style={{ width: "100%", height: "100%" }}>
        <h3 style={{ margin: 0, paddingBottom: 4 }}>{box.id}</h3>
        <p style={{ margin: 0, fontSize: 12 }}>
          Status: {box.status}
        </p>
      </div>
    ))
  );


  return (
    <div
      style={{
        position: "relative",
        width: 1400,
        height: layout.canvasHeight,
        margin: "0 auto",
      }}
    >
      <CanvasLayer config={diagramConfig} layout={layout} />

      {/* FIX: Pass cells down to BoxLayer */}
      <BoxLayer cells={cells} layoutVariant={layoutVariant} />

      <ElbowIcons config={diagramConfig} layout={layout} />
    </div>
  );
}
