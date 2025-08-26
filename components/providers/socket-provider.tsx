'use client';

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo 
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: null | string;
  emit: (event: string, ...args: any[]) => Promise<any>;
  disconnect: () => void;
};

const defaultEmit = () => {
  console.warn('Socket not initialized');
  return Promise.resolve(null);
};

const defaultDisconnect = () => {
  console.warn('Socket not initialized');
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionError: null,
  emit: defaultEmit,
  disconnect: defaultDisconnect
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Handle socket connection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const socketInstance = getSocket();
      
      const onConnect = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('Socket connected');
      };

      const onDisconnect = () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      };

      const onError = (error: any) => {
        console.error('Socket error:', error);
        setConnectionError(error.message);
      };

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      socketInstance.on('connect_error', onError);

      setSocket(socketInstance);

      // Cleanup function
      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        socketInstance.off('connect_error', onError);
        disconnectSocket();
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setConnectionError('Failed to connect to the server');
    }
  }, []);

  const emit = useCallback(async (event: string, data: any, callback?: (response: any) => void) => {
    if (!socket) {
      console.warn('Socket not connected');
      return false;
    }
    
    try {
      return new Promise((resolve) => {
        socket.emit(event, data, (response: any) => {
          if (callback) callback(response);
          resolve(response);
        });
      });
    } catch (error) {
      console.error('Error emitting event:', error);
      return false;
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('Disconnecting socket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<SocketContextType>(() => ({
    socket,
    isConnected,
    connectionError,
    emit,
    disconnect
  }), [socket, isConnected, connectionError, emit, disconnect]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
