import { io, Socket, type ManagerOptions, type SocketOptions } from 'socket.io-client';

// Create a singleton socket instance
let socket: Socket | null = null;

// Define socket connection options
type SocketConfig = Partial<ManagerOptions & SocketOptions>;

// Default socket configuration
const defaultSocketConfig: SocketConfig = {
  path: '/api/socketio',
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: true,
  withCredentials: true
};

/**
 * Get or create a socket.io client instance
 * @param config - Optional configuration to override defaults
 * @returns The socket.io client instance
 */
export const getSocket = (config: SocketConfig = {}): Socket => {
  // Return existing socket if connected
  if (socket?.connected) {
    console.log('Using existing socket connection');
    return socket;
  }

  // Get the base URL from environment or use current origin
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (typeof window !== 'undefined' ? window.location.origin : '');
  const socketUrl = baseUrl ? new URL('/api/socketio', baseUrl).toString() : '/api/socketio';

  console.log('Initializing WebSocket connection to:', socketUrl);

  // Merge default config with any provided config
  const socketConfig: SocketConfig = {
    ...defaultSocketConfig,
    ...config,
  };

  try {
    // Initialize new socket connection
    socket = io(socketUrl, socketConfig);
  } catch (error) {
    console.error('Error initializing socket connection:', error);
    throw error;
  }

  // Connection event handlers
  const handleConnect = () => {
    console.log('Socket connected with ID:', socket?.id);
  };

  const handleDisconnect = (reason: string) => {
    console.log('Socket disconnected. Reason:', reason);
    if (reason === 'io server disconnect' || reason === 'io client disconnect') {
      // Attempt to reconnect if we were disconnected by the server
      setTimeout(() => {
        socket?.connect();
      }, 1000);
    }
  };

  const handleConnectError = (error: Error) => {
    console.error('Socket connection error:', error);
  };

  const handleReconnectAttempt = (attempt: number) => {
    console.log(`Reconnection attempt ${attempt}/${socketConfig.reconnectionAttempts}`);
  };

  const handleReconnectError = (error: Error) => {
    console.error('Socket reconnection error:', error);
  };

  // Set up event listeners
  socket.on('connect', handleConnect);
  socket.on('disconnect', handleDisconnect);
  socket.on('connect_error', handleConnectError);
  socket.on('reconnect_attempt', handleReconnectAttempt);
  socket.on('reconnect_error', handleReconnectError);

  // Clean up function to remove event listeners
  const cleanup = () => {
    if (socket) {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_error', handleReconnectError);
    }
  };

  // Set up cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
  }

  return socket;
};

/**
 * Disconnect the socket and clean up resources
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Check if the socket is currently connected
 * @returns boolean indicating connection status
 */
export const isConnected = (): boolean => {
  return socket?.connected || false;
};

/**
 * Get the current socket ID if connected
 * @returns The socket ID or undefined if not connected
 */
export const getSocketId = (): string | undefined => {
  return socket?.id;
};
