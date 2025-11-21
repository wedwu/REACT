// ElbowIcons.jsx
import React from "react";
import { computeConnectionRoutes } from "../utils/routeEngine";

const ElbowIcons = ({ config, layout }) => {
  if (!layout) return null;

  const routes = computeConnectionRoutes(config, layout);

  return (
    <>
      {routes.map((route, i) => {
        const { isDegraded, elbow } = route;

        // Only show icons for degraded connections
        if (!isDegraded || !elbow) return null;

        return (
          <div
            key={i}
            className="elbow-icon"
            style={{
              position: "absolute",
              left: elbow.x - 11,
              top: elbow.y - 11,
              width: 22,
              height: 22,
              background: "#ff5242",
              border: "2px solid white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: "bold",
              zIndex: 20,
              cursor: "pointer",
            }}
          >
            ⚠
          </div>
        );
      })}
    </>
  );
};

export default ElbowIcons;
