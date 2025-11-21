import React from "react";
import { computeConnectionRoutes } from "../utils/routeEngine";

const ElbowIcons = ({ config, layout }) => {
  if (!layout) return null;

  // Use the exact same routing logic as CanvasLayer
  const routes = computeConnectionRoutes(config, layout);

  return (
    <>
      {routes.map((route, i) => {
        const { midX, end, isDegraded } = route;

        // Only show icon for degraded paths
        if (!isDegraded) return null;

        return (
          <div
            key={i}
            className="elbow-icon"
            style={{
              left: midX - 11,
              top: end.y - 11,
              position: "absolute"
            }}
          >
            ⚠
          </div>
        );
      })}
    </>
  );
}

export default ElbowIcons 