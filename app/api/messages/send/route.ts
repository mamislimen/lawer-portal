import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content?.trim()) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verify the user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        user1Id: true,
        user2Id: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    if (conversation.user1Id !== session.user.id && conversation.user2Id !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Determine the receiver ID
    const receiverId = conversation.user1Id === session.user.id 
      ? conversation.user2Id 
      : conversation.user1Id;

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        receiverId,
        conversationId,
        type: 'TEXT',
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

    // Format the response
    const formattedMessage = {
      id: message.id,
      sender: {
        id: message.sender.id,
        name: message.sender.name || 'Unknown User',
        email: message.sender.email,
        image: message.sender.image,
      },
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      isClient: message.sender.id === session.user.id,
    };

    // Broadcast the new message to the conversation room
    const io = (global as any).io;
    if (io) {
      io.to(`conversation:${conversationId}`).emit('newMessage', formattedMessage);
    }

    return NextResponse.json(formattedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
