import { NextResponse } from "next/server"
import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@/lib/rbac"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify user has CLIENT role
    if (session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: "Forbidden: Client access only" },
        { status: 403 }
      )
    }

    // Get the current user with their cases and related data
    const [user, cases, unreadMessages, upcomingMeetings, pendingDocuments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
      prisma.case.findMany({
        where: {
          clientId: session.user.id,
          status: 'OPEN', // Using string literal for status
        },
        select: {
          id: true,
          title: true,
          status: true,
        },
      }),
      prisma.message.count({
        where: {
          receiverId: session.user.id,
          seen: false,
        },
      }),
      prisma.videoCall.count({
        where: {
          participantId: session.user.id,
          scheduledAt: {
            gte: new Date(),
          },
          status: 'SCHEDULED', // Using string literal for status
        },
      }),
      prisma.document.count({
        where: {
          case: {
            clientId: session.user.id,
          },
          type: 'CONTRACT', // Using string literal for document type
        },
      }),
    ])

    // Get recent notifications as activity (last 5)
    const recentActivity = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Format the response with proper typing
    type DashboardResponse = {
      user: {
        id: string;
        name: string | null;
        email: string;
        role: UserRole;
      };
      stats: {
        activeCases: number;
        unreadMessages: number;
        upcomingMeetings: number;
        pendingDocuments: number;
      };
      recentActivity: Array<{
        id: string;
        type: string;
        title: string;
        date: string;
        status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
        description?: string;
        [key: string]: unknown;
      }>;
    };

    // Map user role to match the expected UserRole type
    const userRole = user.role.toLowerCase() as UserRole

    const response: DashboardResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
      stats: {
        activeCases: cases?.length || 0,
        unreadMessages: unreadMessages || 0,
        upcomingMeetings: upcomingMeetings || 0,
        pendingDocuments: pendingDocuments || 0,
      },
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        title: activity.title,
        date: activity.createdAt.toISOString(),
        status: activity.isRead ? 'COMPLETED' : 'PENDING',
        description: activity.message
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
