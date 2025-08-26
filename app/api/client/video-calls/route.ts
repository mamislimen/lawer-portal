import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get video calls where the current user is either host or participant
    const videoCalls = await prisma.videoCall.findMany({
      where: {
        
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

    // Format the response to match the frontend expectations
    const formattedCalls = videoCalls.map((call) => ({
      id: call.id,
      title: call.title,
      description: call.description,
      status: call.status,
      scheduledAt: call.scheduledAt,
      startedAt: call.startedAt,
      endedAt: call.endedAt,
      duration: call.duration,
      recordingUrl: call.recordingUrl,
      agoraChannelName: call.agoraChannelName,
      host: {
        id: call.host.id,
        name: call.host.name || 'Unknown Host',
        email: call.host.email,
        image: call.host.image,
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
      meetingLink: `/meet/${call.agoraChannelName}`,
    }));

    return NextResponse.json(formattedCalls);
  } catch (error) {
    console.error("Error fetching video calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch video calls" },
      { status: 500 }
    );
  }
}
