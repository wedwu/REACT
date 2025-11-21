// src/utils/routeEngine.js

export function computeConnectionRoutes(config, layout) {
  const { boxMap, colWidth } = layout;
  const routes = [];

  const maxLaneWidth = colWidth * 0.25;

  // -------------------------
  // 1. GROUP BY SOURCE
  // -------------------------
  const sourceGroups = {};
  config.connections.forEach(conn => {
    if (!sourceGroups[conn.from]) sourceGroups[conn.from] = [];
    sourceGroups[conn.from].push(conn);
  });

  Object.values(sourceGroups).forEach(conns => {
    const count = conns.length;
    conns.forEach((conn, idx) => {
      const rev = count - idx;
      conn._sourceCount = count;
      conn._sourceIndex = idx;
      conn._sourceLane =
        (rev / (count + 1)) * (maxLaneWidth / config.lineSpacing);
    });
  });

  // -------------------------
  // 2. GROUP BY TARGET
  // -------------------------
  const targetGroups = {};
  config.connections.forEach(conn => {
    if (!targetGroups[conn.to]) targetGroups[conn.to] = [];
    targetGroups[conn.to].push(conn);
  });

  Object.values(targetGroups).forEach(conns => {
    const count = conns.length;
    conns.forEach((conn, idx) => {
      const rev = count - idx;
      conn._targetCount = count;
      conn._targetIndex = idx;
      conn._targetLane =
        (rev / (count + 1)) * (maxLaneWidth / config.lineSpacing);
    });
  });

  // -------------------------
  // 3. BUILD ROUTE GEOMETRY
  // -------------------------
  config.connections.forEach(conn => {
    const startBox = boxMap[conn.from];
    const endBox = boxMap[conn.to];

    if (!startBox || !endBox) return;

    const startCol = startBox.colIndex;
    const endCol = endBox.colIndex;

    const start = {
      x: startBox.x + startBox.w,
      y:
        startBox.y +
        (startBox.h / (conn._sourceCount + 1)) *
          (conn._sourceIndex + 1)
    };

    let endY = endBox.y + endBox.h / 2;
    if (conn._targetCount > 1) {
      const spacing = endBox.h / (conn._targetCount + 1);
      endY = endBox.y + spacing * (conn._targetIndex + 1);
    }

    const end = {
      x: endBox.x,
      y: endY
    };

    // Midpoint Y (for the elbow segment). For now this keeps
    // behaviour similar to the original: elbow stays at start.y.
    const midY = start.y;

    // -------------------------
    // 4. DETERMINE MIDPOINT X
    // -------------------------
    let midX;

    if (startCol === 0 && endCol === 1) {
      // Left fan
      midX = start.x + config.lineSpacing * conn._sourceLane;
    } else if (startCol === 1 && endCol === 2) {
      // Right fan
      midX = end.x - config.lineSpacing * conn._targetLane;
    } else {
      const dir = endCol > startCol ? 1 : -1;
      midX = start.x + dir * config.lineSpacing * (conn._sourceLane || 1);
    }

    // -------------------------
    // 5. DYNAMIC COLOR LOGIC
    // -------------------------
    const isDegraded =
      startBox.status === "down" || endBox.status === "down";

    const lineColor = isDegraded ? "#ff5242" : "#4c5e74";

    // -------------------------
    // 6. PUSH FINAL ROUTE
    // -------------------------
    routes.push({
      conn,
      start,
      midX,
      midY,
      end,
      color: lineColor,
      isDegraded,
      sourceBox: startBox,
      targetBox: endBox
    });
  });

  return routes;
}
