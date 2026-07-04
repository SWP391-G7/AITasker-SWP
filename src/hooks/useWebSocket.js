import { useEffect, useRef } from 'react';

export default function useWebSocket(onMessageReceived) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // Keep callback reference updated without triggering reconnect
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connect = () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      let host = 'localhost:5000';
      try {
        const urlObj = new URL(apiBaseUrl);
        host = urlObj.host;
      } catch (e) {
        if (apiBaseUrl.includes('://')) {
          host = apiBaseUrl.split('://')[1].split('/')[0];
        }
      }

      const wsUrl = `${wsProto}//${host}?token=${token}`;
      console.log('[WS] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected successfully');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (callbackRef.current) {
            callbackRef.current(data);
          }
        } catch (err) {
          console.error('[WS] Error parsing message data:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected. Reconnecting in 3s...');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('[WS] Socket error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const send = (data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Cannot send, socket not open');
    }
  };

  return { send };
}
