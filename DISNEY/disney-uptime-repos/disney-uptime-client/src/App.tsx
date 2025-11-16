import React, { useState } from "react";
import DisneyMapOverlay from "./components/DisneyMapOverlay";
import DisneyMapGridDebug from "./components/DisneyMapGridDebug";

type ViewMode = "normal" | "debug";

export default function App() {
  const [mode, setMode] = useState<ViewMode>("normal");

  const isNormal = mode === "normal";
  const isDebug = mode === "debug";

  return (
    <div className="app">
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Disney Uptime</h1>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {isNormal
              ? "Normal map overlay view (using rides.json)"
              : "Grid debug mode — click to get exact x,y for rides.json"}
          </div>
        </div>

        {/* Toggle buttons */}
        <div
          style={{
            display: "inline-flex",
            borderRadius: 999,
            padding: 2,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.5)"
          }}
        >
          <button
            type="button"
            onClick={() => setMode("normal")}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              cursor: "pointer",
              background: isNormal ? "#f97316" : "transparent",
              color: isNormal ? "#0f172a" : "#e5e7eb",
              fontWeight: isNormal ? 700 : 500
            }}
          >
            Normal View
          </button>
          <button
            type="button"
            onClick={() => setMode("debug")}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              cursor: "pointer",
              background: isDebug ? "#f97316" : "transparent",
              color: isDebug ? "#0f172a" : "#e5e7eb",
              fontWeight: isDebug ? 700 : 500
            }}
          >
            Grid Debug View
          </button>
        </div>
      </header>

      {isNormal ? (
        <DisneyMapOverlay
          jsonPath="/rides.json"
          backgroundImage="/park-map.svg"
        />
      ) : (
        <DisneyMapGridDebug backgroundImage="/park-map.svg" />
      )}
    </div>
  );
}

// export default function App() {
//   return (
//     <div className="app">
//       <h1>Disney Uptime — Live Dashboard</h1>
//       <DisneyUptimeCanvas />
//       {/*<DisneyUptimeCanvas endpoint="/api/rides" wsPath="/" />*/}
//     </div>
//   );
// }
