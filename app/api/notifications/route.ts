import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const where: any = { userId: session.user.id }
    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/notifications/[id]/read - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
