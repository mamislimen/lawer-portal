'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const socketInstance = getSocket();
      setSocket(socketInstance);

      const onConnect = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        console.log('Socket connected:', socketInstance.id);
      };

      const onDisconnect = (reason: string) => {
        setIsConnected(false);
        console.log('Socket disconnected:', reason);
        
        // Attempt to reconnect if this wasn't a manual disconnection
        if (reason !== 'io client disconnect') {
          attemptReconnect();
        }
      };

      const onConnectError = (error: Error) => {
        console.error('Socket connection error:', error);
        setConnectionError(error.message);
        attemptReconnect();
      };

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('connect_error', onConnectError);

      // Set initial connection state
      if (socketInstance.connected) {
        onConnect();
      }

      return socketInstance;
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect');
      return null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      setConnectionError('Unable to connect to the server. Please refresh the page to try again.');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff with max 30s
    reconnectAttempts.current++;

    console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socket && !socket.connected) {
        socket.connect();
      }
    }, delay);
  }, [socket]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting socket...');
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('disconnect');
        socketInstance.off('connect_error');
        disconnect();
      }
    };
  }, [connect, disconnect]);

  const emit = useCallback((event: string, data: any, callback?: (response: any) => void) => {
    if (!socket || !isConnected) {
      console.error('Cannot emit: Socket not connected');
      return false;
    }
    
    return new Promise((resolve) => {
      try {
        socket.emit(event, data, (response: any) => {
          if (callback) callback(response);
          resolve(response);
        });
      } catch (error) {
        console.error(`Error emitting event ${event}:`, error);
        resolve(null);
      }
    });
  }, [socket, isConnected]);

  return { 
    socket, 
    isConnected, 
    connectionError,
    emit,
    disconnect
  };
};
