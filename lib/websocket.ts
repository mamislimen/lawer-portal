import { WebSocketServer } from 'ws';
import { prisma } from './prisma';
import { IncomingMessage } from 'http';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextApiRequest } from 'next';

interface WebSocketWithUser extends WebSocket {
  userId?: string;
  on(event: 'message', listener: (data: string) => void): void;
  on(event: 'close', listener: () => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
}

// Store active connections
const clients = new Map<string, WebSocketWithUser>();

// Function to broadcast a message to a specific user
const sendToUser = (userId: string, data: any) => {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

// Function to broadcast a message to multiple users
const broadcastToUsers = (userIds: string[], data: any) => {
  userIds.forEach(userId => sendToUser(userId, data));
};

export const setupWebSocketServer = (server: any) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocketWithUser, req: IncomingMessage) => {
    // Extract user ID from the session
    const session = await getServerSession(
      req as any,
      { ...(req as any).res },
      authOptions
    );

    if (!session?.user?.id) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const userId = session.user.id;
    clients.set(userId, ws);

    // Send connection confirmation
    ws.send(JSON.stringify({ type: 'CONNECTION_ESTABLISHED' }));

    // Handle incoming messages
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'MESSAGE':
            const { content, conversationId, receiverId } = data;
            
            // Save message to database
            const message = await prisma.message.create({
              data: {
                content,
                senderId: userId,
                receiverId,
                conversationId,
                type: 'TEXT',
                // Read status is managed by a separate field in the Message model
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            });

            // Notify receiver
            sendToUser(receiverId, {
              type: 'NEW_MESSAGE',
              message,
            });
            
            // Update conversation timestamp
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { 
                // Use the current timestamp for the update
                // The updatedAt field is automatically managed by Prisma with @updatedAt
              },
            });
            
            // Notify sender of successful delivery
            ws.send(JSON.stringify({
              type: 'MESSAGE_DELIVERED',
              messageId: message.id,
            }));
            break;

          case 'TYPING':
            const { isTyping, conversationId: typingConversationId } = data;
            // Notify other participants in the conversation
            const conversation = await prisma.conversation.findUnique({
              where: { id: typingConversationId },
              select: { user1Id: true, user2Id: true },
            });
            
            if (conversation) {
              const otherUserId = conversation.user1Id === userId 
                ? conversation.user2Id 
                : conversation.user1Id;
              
              sendToUser(otherUserId, {
                type: 'USER_TYPING',
                userId,
                isTyping,
                conversationId: typingConversationId,
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(userId);
    });
  });

  return wss;
};
