import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

declare global {
  // Use namespace to avoid conflict with client-side Socket.IO types
  namespace NodeJS {
    interface Global {
      io?: Server;
    }
  }
}

// Define the interface for appointment update data
interface AppointmentUpdateData {
  appointmentId: string;
  lawyerId: string;
  update: any; // Consider defining a more specific type for the update
}

// Initialize the Socket.IO server
let ioInstance: Server | null = null;

const initSocket = (httpServer: HttpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  setupSocketListeners(ioInstance);
  return ioInstance;
};

const setupSocketListeners = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    // Join a conversation
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User joined conversation: ${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', (data: { conversationId: string; senderId: string; content: string }) => {
      const { conversationId, senderId, content } = data;
      
      // Broadcast the message to all clients in the conversation room
      socket.to(`conversation_${conversationId}`).emit('receive_message', {
        conversationId,
        senderId,
        content,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Message sent to conversation ${conversationId} by user ${senderId}`);
    });

    // Join an appointment room
    socket.on('join_appointment', (appointmentId: string) => {
      socket.join(`appointment_${appointmentId}`);
      console.log(`User joined appointment: ${appointmentId}`);
    });

    // Join all appointments for a lawyer
    socket.on('join_lawyer_appointments', (lawyerId: string) => {
      socket.join(`lawyer_${lawyerId}_appointments`);
      console.log(`User joined lawyer appointments: ${lawyerId}`);
    });

    // Handle sending messages
    socket.on('send_message', (data: {
      conversationId: string;
      senderId: string;
      content: string;
    }) => {
      // Broadcast the message to all clients in the conversation room
      io.to(`conversation_${data.conversationId}`).emit('receive_message', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle appointment updates
    socket.on('update_appointment', (data: {
      appointmentId: string;
      lawyerId: string;
      update: any;
    }) => {
      // Notify all clients in the appointment room
      io.to(`appointment_${data.appointmentId}`).emit('appointment_updated', {
        ...data.update,
        id: data.appointmentId,
      });

      // Also notify all clients viewing the lawyer's appointments
      io.to(`lawyer_${data.lawyerId}_appointments`).emit('appointments_updated');
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string; userId: string }) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: data.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};

export { initSocket, setupSocketListeners };

export const getIo = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return ioInstance;
};

// For backward compatibility
declare const global: NodeJS.Global & { io?: Server };

// Initialize the global instance for backward compatibility
if (typeof global.io === 'undefined' && ioInstance) {
  global.io = ioInstance;
}

// Export the ioInstance for direct access
export { ioInstance };
