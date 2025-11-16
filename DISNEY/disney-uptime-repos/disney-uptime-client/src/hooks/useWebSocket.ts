// hook placeholder

import { useEffect, useRef, useState } from "react";

export function useWebSocket<T = any>(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<T | null>(null);

  useEffect(() => {
    if (!url) return;

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const finalUrl = url.startsWith("ws")
      ? url
      : `${proto}//${window.location.host}${url}`;

    const ws = new WebSocket(finalUrl);
    wsRef.current = ws;

    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));
    ws.addEventListener("error", () => setConnected(false));
    ws.addEventListener("message", (e) => {
      try {
        setLastMessage(JSON.parse(e.data));
      } catch {}
    });

    // return () => ws.close();
    return () => {
      try {
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
              ws.close();
          }
      } catch {}
    };
  }, [url]);

  return { connected, lastMessage, raw: wsRef.current };
}
