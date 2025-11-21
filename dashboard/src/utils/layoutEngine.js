export function calculateLayout(config, canvasWidth) {
  const maxBoxes = Math.max(...config.columns.map(c => c.boxes.length));
  const canvasHeight = maxBoxes * (config.baseBoxHeight + config.boxMargin * 2);
  const colWidth = canvasWidth / config.columns.length;

  const boxMap = {};
  const boxes = [];

  for (let colIndex = 0; colIndex < config.columns.length; colIndex++) {
    const column = config.columns[colIndex];
    const colBoxes = column.boxes;
    const boxHeight = canvasHeight / maxBoxes;

    colBoxes.forEach((box, i) => {
      const x = colWidth * colIndex + config.boxMargin;

      let y;
      if (colIndex === 0) {
        if (i === 0) y = config.boxMargin;
        else {
          const indexFromBottom = colBoxes.length - i;
          const startBottom = canvasHeight - boxHeight + config.boxMargin;
          y = startBottom - (indexFromBottom - 1) * boxHeight;
        }
      } else {
        y = i * boxHeight + config.boxMargin;
      }

      const w = (colWidth - config.boxMargin * 2) * 0.7;
      const h = boxHeight - config.boxMargin * 2;

      const boxData = {
        id: box.id,
        status: box.status,
        x, y, w, h,
        colIndex,
        index: i
      };

      boxMap[box.id] = boxData;
      boxes.push(boxData);
    });
  }

  return { boxMap, boxes, canvasHeight, colWidth };
}
