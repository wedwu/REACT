// src/components/DiagramContainer.jsx

import React, { useMemo } from "react";
import CanvasLayer from "./CanvasLayer";
import BoxLayer from "./BoxLayer";
import { calculateLayout } from "../utils/layoutEngine";
import { diagramConfig } from "../config/diagramConfig";

const DiagramContainer = () => {
  const layout = useMemo(
    () => calculateLayout(diagramConfig, 1400),
    []
  );

  return (
    <div
      style={{
        position: "relative",
        width: 1400,
        height: layout?.canvasHeight || 800,
        margin: "0 auto"
      }}
    >
      {layout && (
        <>
          {/* Canvas underlay: needs config + layout */}
          <CanvasLayer config={diagramConfig} layout={layout} />

          {/* Div overlay: needs absolute box positions */}
          <BoxLayer boxMap={layout.boxMap} />
        </>
      )}
    </div>
  );
}

export default DiagramContainer