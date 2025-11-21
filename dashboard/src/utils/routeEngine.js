// src/utils/routeEngine.js
export function computeConnectionRoutes(config, layout) {
  const { boxMap, colWidth } = layout;
  const routes = [];

  const maxLaneWidth = colWidth * 0.25;

  // -------------------------
  // GROUP BY SOURCE
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
  // GROUP BY TARGET
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
  // BUILD ROUTE
  // -------------------------
  config.connections.forEach(conn => {
    const startBox = boxMap[conn.from];
    const endBox = boxMap[conn.to];
    if (!startBox || !endBox) return;

    const startCol = startBox.colIndex;
    const endCol = endBox.colIndex;

    // Starting point
    const start = {
      x: startBox.x + startBox.w,
      y:
        startBox.y +
        (startBox.h / (conn._sourceCount + 1)) *
          (conn._sourceIndex + 1)
    };

    // Ending point
    let endY = endBox.y + endBox.h / 2;
    if (conn._targetCount > 1) {
      const spacing = endBox.h / (conn._targetCount + 1);
      endY = endBox.y + spacing * (conn._targetIndex + 1);
    }

    const end = {
      x: endBox.x,
      y: endY
    };

    // Midpoint
    const midY = start.y;

    // MidX (fan)
    let midX;
    if (startCol === 0 && endCol === 1) {
      midX = start.x + config.lineSpacing * conn._sourceLane;
    } else if (startCol === 1 && endCol === 2) {
      midX = end.x - config.lineSpacing * conn._targetLane;
    } else {
      const dir = endCol > startCol ? 1 : -1;
      midX = start.x + dir * config.lineSpacing * (conn._sourceLane || 1);
    }

    // -------------------------
    // COLOR + DEGRADED
    // -------------------------
    const isDegraded =
      startBox.status === "down" || endBox.status === "down";

    const lineColor = isDegraded ? "#ff5242" : "#4c5e74";

    // -------------------------
    // ELBOW ICON SUPPORT
    // Only show if degraded
    // -------------------------
    const elbowIcons = [];

    if (isDegraded) {
      // Second elbow (vertical → horizontal)
      elbowIcons.push({
        x: midX,
        y: end.y
      });

    }

    // -------------------------
    // PUSH FINAL ROUTE
    // -------------------------
    routes.push({
      conn,
      start,
      midX,
      midY,
      end,
      color: lineColor,
      isDegraded,
      elbowIcons,
      sourceBox: startBox,
      targetBox: endBox
    });
  });

  return routes;
}
