// src/components/ElbowIcons.jsx
import React from "react";

export default function ElbowIcons({ routes }) {
  if (!routes) return null;

  return (
    <>
      {routes.map((route, i) => {
        if (!route.isDegraded) return null;
        if (!route.elbowIcons || route.elbowIcons.length === 0) return null;

        // We ONLY want the second elbow
        const secondElbow = route.elbowIcons[0]; 

        if (!secondElbow) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: secondElbow.x - 12,
              top: secondElbow.y - 12,
              width: 24,
              height: 24,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <img
              src="/icons/elbow-warning.png"
              alt="degraded elbow"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        );
      })}
    </>
  );
}
