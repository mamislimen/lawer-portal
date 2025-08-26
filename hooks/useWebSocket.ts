// hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export const useWebSocket = (onMessage: (data: any) => void) => {
  const { data: session } = useSession();
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current || !session?.user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${protocol}${window.location.host}/api/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      ws.current = null;
      // Reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.current?.close();
    };
  }, [session?.user?.id, onMessage]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return { sendMessage };
};