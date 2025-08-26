import { NextResponse } from "next/server";
import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const clientId = session.user.id;

    const [documents, messages, appointments, videoCalls] = await Promise.all([
      // Documents uploaded by the client
      prisma.document.findMany({
        where: {
          case: {
            clientId,
          },
        },
        select: {
          id: true,
          originalName: true,
          type: true,
          url: true,
          createdAt: true,
          case: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Messages related to client's cases
      prisma.message.findMany({
        where: {
          case: {
            clientId,
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          case: { select: { id: true, title: true } },
          sender: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // Client appointments
      prisma.appointment.findMany({
        where: {
          clientId,
          status: "SCHEDULED",
          startTime: { gte: new Date() },
        },
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          case: { select: { id: true, title: true } },
        },
        orderBy: { startTime: "asc" },
        take: 5,
      }),

      // Video calls related to client's cases
      prisma.videoCall.findMany({
        where: {
          participantId: clientId,
          status: "SCHEDULED",
          scheduledAt: { gte: new Date() },
        },
        select: {
          id: true,
          title: true,
          description: true,
          scheduledAt: true,
          case: { select: { id: true, title: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
    ]);

    // Format activities
    type Activity = {
      id: string;
      type: "DOCUMENT_UPLOAD" | "MESSAGE" | "APPOINTMENT" | "VIDEO_CALL";
      title: string;
      description: string;
      date: string;
      caseId?: string;
      documentUrl?: string;
    };

    const activities: Activity[] = [
      ...documents.map((doc) => ({
        id: `doc-${doc.id}`,
        type: "DOCUMENT_UPLOAD" as const,
        title: "Document Uploaded",
        description: doc.originalName,
        date: doc.createdAt.toISOString(),
        caseId: doc.case?.id,
        documentUrl: doc.url,
      })),
      ...messages.map((msg) => ({
        id: `msg-${msg.id}`,
        type: "MESSAGE" as const,
        title: `Message from ${msg.sender.name}`,
        description:
          msg.content.length > 100
            ? msg.content.substring(0, 100) + "..."
            : msg.content,
        date: msg.createdAt.toISOString(),
        caseId: msg.case?.id,
      })),
      ...appointments.map((appt) => ({
        id: `appt-${appt.id}`,
        type: "APPOINTMENT" as const,
        title: "Upcoming Appointment",
        description: appt.title || "Scheduled meeting",
        date: appt.startTime.toISOString(),
        caseId: appt.case?.id,
      })),
      ...videoCalls.map((call) => ({
        id: `call-${call.id}`,
        type: "VIDEO_CALL" as const,
        title: "Upcoming Video Call",
        description: call.title || "Scheduled call",
        date: call.scheduledAt.toISOString(),
        caseId: call.case?.id,
      })),
    ];

    // Sort by newest first
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
