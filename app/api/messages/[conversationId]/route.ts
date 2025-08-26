import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MESSAGES_PER_PAGE = 20;

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { conversationId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || MESSAGES_PER_PAGE.toString());

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

    // Get total count of messages for pagination
    const totalMessages = await prisma.message.count({
      where: { conversationId },
    });
    
    const totalPages = Math.ceil(totalMessages / limit);
    const hasMore = page < totalPages;

    // Fetch messages for the conversation with pagination
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' }, // Get newest first
      take: limit,
      skip: (page - 1) * limit,
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
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: {
        id: msg.sender.id,
        name: msg.sender.name || 'Unknown User',
        email: msg.sender.email,
        image: msg.sender.image,
      },
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
      read: msg.read,
      readAt: msg.readAt?.toISOString() || null,
      isClient: msg.senderId === session.user.id,
    }));

    return NextResponse.json({
      messages: formattedMessages.reverse(), // Reverse to show oldest first on the client
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalMessages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
