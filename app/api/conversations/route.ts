import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.user1Id === session.user?.id ? conv.user2 : conv.user1;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        participants: [conv.user1, conv.user2],
        lastMessage: lastMessage?.content || 'No messages yet',
        unreadCount: 0, // TODO: Implement unread count when read status is added to Message model
        updatedAt: conv.createdAt,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          email: otherUser.email,
          image: otherUser.image,
        },
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { participantId } = await req.json();

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: session.user.id,
            user2Id: participantId,
          },
          {
            user1Id: participantId,
            user2Id: session.user.id,
          },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        user1Id: session.user.id,
        user2Id: participantId,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
