import { useEffect, useRef } from 'react';

/**
 * Simple realtime hook that attempts a WebSocket connection to the backend.
 * Falls back to no-op if unreachable. Consumers can pass handlers.
 */
export function useRealtime({ url = 'ws://localhost:3001', onMessage, onOpen, onClose, onError } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.addEventListener('open', (evt) => {
        if (!isMounted) return;
        if (onOpen) onOpen(evt);
      });
      ws.addEventListener('message', (evt) => {
        if (!isMounted) return;
        if (onMessage) onMessage(evt.data);
      });
      ws.addEventListener('close', (evt) => {
        if (!isMounted) return;
        if (onClose) onClose(evt);
      });
      ws.addEventListener('error', (evt) => {
        if (!isMounted) return;
        if (onError) onError(evt);
      });
    } catch {}

    return () => {
      isMounted = false;
      try {
        if (socketRef.current && socketRef.current.readyState === 1) {
          socketRef.current.close();
        }
      } catch {}
    };
  }, [url, onMessage, onOpen, onClose, onError]);

  return socketRef;
}


