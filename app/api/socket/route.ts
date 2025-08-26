import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server');
  
  // Create Socket.IO server
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL?.split(',') || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Set up socket events
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Store the io instance
  res.socket.server.io = io;
  res.end();
}
