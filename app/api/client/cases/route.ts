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

    // Get cases where the current user is the client
    const cases = await prisma.case.findMany({
      where: {
        clientId: session.user.id,
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            documents: true,
            messages: true,
            videoCalls: {
              where: {
                status: "SCHEDULED",
                scheduledAt: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the response to match the frontend expectations
    const formattedCases = cases.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status.replace(/_/g, " "), // Convert snake_case to space separated
      priority: c.priority,
      startDate: c.createdAt.toISOString().split("T")[0],
      nextHearing: c.dueDate ? c.dueDate.toISOString().split("T")[0] : "N/A",
      lawyer: c.lawyer.name || "Unknown Lawyer",
      estimatedValue: c._count.documents > 0 ? `$${c._count.documents * 5000}` : "N/A",
      documents: c._count.documents,
      lastUpdate: c.updatedAt.toISOString().split("T")[0],
      unreadMessages: c._count.messages,
      upcomingMeetings: c._count.videoCalls,
    }));

    return NextResponse.json(formattedCases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}
