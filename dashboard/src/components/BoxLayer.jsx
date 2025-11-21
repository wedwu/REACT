import { useEffect, useRef } from "react";

export default function BoxLayer({ boxes, onBoxResize }) {
  return (
    <>
      {boxes.map(box => (
        <MeasuredBox
          key={box.id}
          box={box}
          onBoxResize={onBoxResize}
        />
      ))}
    </>
  );
}

function MeasuredBox({ box, onBoxResize }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        onBoxResize(box.id, entry.contentRect);
      }
    });

    observer.observe(el);

    // call immediately once
    onBoxResize(box.id, el.getBoundingClientRect());

    return () => observer.disconnect();
  }, [box.id, onBoxResize]);

  return (
    <div
      ref={ref}
      className="dynamic-box"
      style={{
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        border: `4px solid ${
          box.status === "down" ? "#ff5242" : "#4c5e74"
        }`
      }}
    >
      <h3>{box.id}</h3>
      <p>
        Status: {box.status}<br />
        Column: {box.colIndex + 1}<br />
        Index: {box.index}
      </p>
    </div>
  );
}
