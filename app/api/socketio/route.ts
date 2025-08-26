import { IncomingMessage, Server as NetServer } from 'http';
import { Server as ServerIO, Socket } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';

// Type for the socket server with io instance
type SocketServer = (HttpServer | HttpsServer) & {
  io?: ServerIO;
};

// Type for the response with socket.io
type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: SocketServer;
  } | null;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

interface MessageData {
  conversationId: string;
  senderId: string;
  content: string;
  timestamp?: string;
}

// This prevents Next.js from handling the request, allowing us to handle it with Socket.IO
// This is necessary for WebSockets to work in Next.js 13+
export const dynamic = 'force-dynamic';

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Type assertion for the response object with null check
  const response = res as unknown as NextApiResponseWithSocket;
  
  if (!response.socket?.server) {
    console.error('No server instance available');
    res.status(500).json({ success: false, message: 'No server instance available' });
    return;
  }
  // Check if socket.io is already initialized
  if (response.socket.server.io) {
    console.log('Socket is already running');
    res.status(200).json({ success: true, message: 'Socket.IO already running' });
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  // Get the HTTP server instance from Next.js
  const httpServer = response.socket.server;
  
  if (!response.socket.server.io) {
    console.log('Creating new Socket.IO server...');
  
  // Get allowed origins from environment or use default
  const allowedOrigins = process.env.NEXT_PUBLIC_APP_URL?.split(',').map(url => url.trim()) || [
    'http://localhost:3000',
  ];

  console.log('Allowed origins:', allowedOrigins);
  
  // Initialize Socket.IO server with improved configuration
  const io = new ServerIO(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    // CORS configuration
    cors: {
      origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // Transport configuration
    transports: ['websocket', 'polling'],
    // Connection settings
    connectTimeout: 10000, // 10 seconds
    pingTimeout: 10000,    // 10 seconds
    pingInterval: 25000,   // 25 seconds
    // Increase max HTTP buffer size
    maxHttpBufferSize: 1e8, // 100MB
    // HTTP compression
    perMessageDeflate: {
      threshold: 1024, // Size threshold in bytes
      zlibDeflateOptions: {
        level: 3 // Compression level (0-9), 3 is a good balance
      },
      clientNoContextTakeover: true
    },
    httpCompression: {
      threshold: 1024 // Size threshold in bytes
    },
    // Other settings
    allowEIO3: true,   // Enable compatibility with Socket.IO v2 clients
    cookie: false,     // Disable cookie-based session ID
    serveClient: false // Don't serve the client file
  });
  
  console.log('Socket.IO server initialized with options:', {
    path: '/api/socketio',
    cors: { origin: allowedOrigins },
    transports: ['websocket', 'polling']
  });

  // Store the io instance in the global object for access in other API routes
  (global as any).io = io;

  // Handle new connections
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId: string) => {
      if (!conversationId) {
        console.error('No conversationId provided for join_conversation');
        return;
      }
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Handle new messages
    socket.on('send_message', (data: MessageData) => {
      try {
        const { conversationId, senderId, content } = data;
        
        if (!conversationId || !senderId || !content) {
          console.error('Missing required fields in send_message', { conversationId, senderId });
          return;
        }

        console.log(`New message in conversation ${conversationId} from ${senderId}`);
        
        // Broadcast the message to all clients in the conversation room except the sender
        const messageData: MessageData = {
          conversationId,
          senderId,
          content,
          timestamp: new Date().toISOString(),
        };
        
        socket.to(`conversation:${conversationId}`).emit('receive_message', messageData);
        
      } catch (error) {
        console.error('Error handling send_message:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected (${reason}): ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  });

  // Handle server errors
  io.on('error', (error: Error) => {
    console.error('Socket.IO server error:', error);
  });

      // Store the io instance in the Next.js response
    response.socket.server.io = io;
    console.log('Socket.IO server initialized successfully');
  } else {
    console.log('Socket.IO server already initialized');
  }
  
  // Send response
  res.status(200).json({ success: true, message: 'Socket.IO server initialized' });
}
