import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { conversationId } = params;

    if (!conversationId) {
      return new NextResponse('Conversation ID is required', { status: 400 });
    }

    // Mark all messages in this conversation as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: session.user.id,
        readAt: null,
      },
      data: {
        readAt: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
