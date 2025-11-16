import React, { useEffect, useState } from "react";
import { Ride } from "../types";

type DisneyMapOverlayProps = {
  jsonPath?: string;            // local JSON path, default /rides.json
  backgroundImage?: string;     // map image path, default /park-map.jpg
};

const uptimeColor = (u: number) =>
  u >= 99 ? "#16a34a" : u >= 95 ? "#f59e0b" : "#ef4444";

export default function DisneyMapOverlay({
  jsonPath = "/rides.json",
  backgroundImage = "/park-map.jpg"
}: DisneyMapOverlayProps) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load local JSON
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setError(null);
        const res = await fetch(jsonPath, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        setRides(json.rides || []);
      } catch (e: any) {
        console.error("Failed to load rides.json", e);
        if (mounted) setError(e.message || "Failed to load rides.json");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [jsonPath]);

  const selected = rides.find((r) => r.id === selectedId) || rides[0] || null;

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
      {/* Map area */}
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 480,
          borderRadius: 16,
          overflow: "hidden",
          background: "#020617",
          boxShadow: "0 15px 40px rgba(0,0,0,0.7)"
        }}
      >
        {/* Map image */}
        <img
          src={backgroundImage}
          alt="Park map"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.2,
            pointerEvents: "none"
          }}
          onError={(e) => {
            // hide if missing
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Ride markers */}
        {rides.map((ride) => {
          const x = (ride.x ?? 0.5) * 100;
          const y = (ride.y ?? 0.5) * 100;
          const size = 18 + (ride.uptime / 100) * 32;
          const color = uptimeColor(ride.uptime);
          const isActive = selected && selected.id === ride.id;

          return (
            <button
              key={ride.id}
              type="button"
              onClick={() => setSelectedId(ride.id)}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                width: size,
                height: size,
                borderRadius: "999px",
                border: isActive ? "3px solid #e5e7eb" : "2px solid rgba(15,23,42,0.9)",
                background: color,
                boxShadow: isActive
                  ? "0 0 0 6px rgba(248,250,252,0.18)"
                  : "0 10px 25px rgba(0,0,0,0.7)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f172a",
                fontSize: 11,
                fontWeight: 700,
                padding: 0
              }}
              title={`${ride.name} — ${ride.uptime.toFixed(1)}%`}
            >
              {Math.round(ride.uptime)}
            </button>
          );
        })}

        {/* Error state */}
        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.9)",
              color: "#fecaca",
              fontSize: 14,
              padding: 16,
              textAlign: "center"
            }}
          >
            Error loading rides.json: {error}
          </div>
        )}
      </div>

      {/* Side panel */}
      <div
        style={{
          width: 320,
          padding: 16,
          borderRadius: 16,
          background: "rgba(15,23,42,0.95)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Ride Uptime (local)</h3>
          <span style={{ fontSize: 11, opacity: 0.8 }}>
            {rides.length} rides
          </span>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Data loaded from <code>{jsonPath}</code> (no server required).
        </div>

        <hr style={{ borderColor: "rgba(30,64,175,0.5)" }} />

        {/* Selected ride details */}
        {selected ? (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.16), rgba(15,23,42,0.9))",
              border: "1px solid rgba(59,130,246,0.4)"
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
              Selected ride
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
            <div style={{ marginTop: 4, fontSize: 14 }}>
              Uptime:{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: uptimeColor(selected.uptime)
                }}
              >
                {selected.uptime.toFixed(2)}%
              </span>{" "}
              ({selected.isUp ? "UP" : "DOWN"})
            </div>
            {selected.lastChanged && (
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Last status change:{" "}
                {new Date(selected.lastChanged).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Click a bubble on the map to see details.
          </div>
        )}

        {/* List of rides */}
        <div
          style={{
            marginTop: 8,
            maxHeight: 260,
            overflowY: "auto",
            paddingRight: 4
          }}
        >
          {rides.map((r) => {
            const active = selected && selected.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 6,
                  padding: 8,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: active
                    ? "rgba(55,65,81,0.9)"
                    : "rgba(15,23,42,0.8)",
                  color: "#e5e7eb",
                  fontSize: 13
                }}
              >
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, opacity: 0.85 }}>
                  {r.uptime.toFixed(1)}% — {r.isUp ? "UP" : "DOWN"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
