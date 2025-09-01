import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id);

    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get video calls where the current user is either host or participant
    const videoCalls = await prisma.videoCall.findMany({
      where: {
        OR: [
          { hostId: session.user.id },
          { participantId: session.user.id }
        ]
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        case: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    if (!videoCalls) {
      return NextResponse.json([], { status: 200 });
    }

    console.log('Found video calls:', videoCalls.length);
    
    // Format the response to match the frontend expectations
    const formattedCalls = videoCalls.map((call) => {
      try {
        return {
          id: call.id,
          title: call.title,
          description: call.description,
          status: call.status,
          scheduledAt: call.scheduledAt,
          startedAt: call.startedAt,
          endedAt: call.endedAt,
          duration: call.duration,
          recordingUrl: call.recordingUrl,
          roomName: call.roomName,
          host: {
            id: call.host?.id || 'unknown',
            name: call.host?.name || 'Unknown Host',
            email: call.host?.email || '',
            image: call.host?.image || null,
          },
          participant: call.participant ? {
            id: call.participant.id,
            name: call.participant.name || 'Unknown Participant',
            email: call.participant.email,
            image: call.participant.image,
          } : null,
          case: call.case ? {
            id: call.case.id,
            title: call.case.title,
          } : null,
          isHost: call.hostId === session.user.id,
          meetingLink: call.roomName ? `/meet/${call.roomName}` : null,
        };
      } catch (error) {
        console.error('Error formatting call:', call.id, error);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json(formattedCalls);
  } catch (error) {
    console.error("Error fetching video calls:", error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch video calls",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
