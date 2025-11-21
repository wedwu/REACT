import { useMemo, useState, useCallback } from "react";
import { calculateLayout } from "../utils/layoutEngine";
import CanvasLayer from "./CanvasLayer";
import BoxLayer from "./BoxLayer";
import ElbowIcons from "./ElbowIcons";

export default function DiagramContainer({ config }) {
  const [boxSizes, setBoxSizes] = useState({}); // { id: {w,h} }

  // Called by BoxLayer when a box resizes
  const handleBoxResize = useCallback((id, rect) => {
    setBoxSizes(prev => {
      const next = { ...prev, [id]: { w: rect.width, h: rect.height } };
      return next;
    });
  }, []);

  // Build layout using REAL box heights (if available)
  const layout = useMemo(() => {
    return calculateLayout(config, 1400, boxSizes);
  }, [config, boxSizes]);

  return (
    <div
      style={{
        position: "relative",
        width: 1400,
        height: layout.canvasHeight,
        margin: "0 auto"
      }}
    >
      <CanvasLayer config={config} layout={layout} />
      <BoxLayer
        boxes={layout.boxes}
        onBoxResize={handleBoxResize}
      />
      <ElbowIcons config={config} layout={layout} />
    </div>
  );
}
