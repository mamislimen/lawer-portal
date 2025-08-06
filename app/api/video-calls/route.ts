import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createVideoCallSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  participantId: z.string().min(1, "Participant ID is required"),
  caseId: z.string().optional(),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
})

const updateVideoCallSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  scheduledAt: z.string().optional(),
})

// GET /api/video-calls - Get video calls for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const upcoming = searchParams.get("upcoming") === "true"

    const where: any = {
      OR: [{ hostId: session.user.id }, { participantId: session.user.id }],
    }

    if (status) {
      where.status = status
    }

    if (upcoming) {
      where.scheduledAt = {
        gte: new Date(),
      }
      where.status = {
        in: ["SCHEDULED", "IN_PROGRESS"],
      }
    }

    const videoCalls = await prisma.videoCall.findMany({
      where,
      include: {
        host: {
          select: { id: true, name: true, email: true, image: true },
        },
        participant: {
          select: { id: true, name: true, email: true, image: true },
        },
        case: {
          select: { id: true, title: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })

    return NextResponse.json(videoCalls)
  } catch (error) {
    console.error("Error fetching video calls:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/video-calls - Create a new video call
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createVideoCallSchema.parse(body)

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: validatedData.participantId },
    })

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }

    // If caseId is provided, verify access
    if (validatedData.caseId) {
      const caseAccess = await prisma.case.findFirst({
        where: {
          id: validatedData.caseId,
          OR: [{ lawyerId: session.user.id }, { clientId: session.user.id }],
        },
      })

      if (!caseAccess) {
        return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 })
      }
    }

    // Generate unique channel name for Agora
    const channelName = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const videoCall = await prisma.videoCall.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        hostId: session.user.id,
        participantId: validatedData.participantId,
        caseId: validatedData.caseId,
        scheduledAt: new Date(validatedData.scheduledAt),
        agoraChannelName: channelName,
      },
      include: {
        host: {
          select: { id: true, name: true, email: true, image: true },
        },
        participant: {
          select: { id: true, name: true, email: true, image: true },
        },
        case: {
          select: { id: true, title: true },
        },
      },
    })

    // Create notification for participant
    await prisma.notification.create({
      data: {
        userId: validatedData.participantId,
        title: "Video Call Scheduled",
        message: `A video call "${validatedData.title}" has been scheduled with you`,
        type: "VIDEO_CALL",
      },
    })

    return NextResponse.json(videoCall, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating video call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/video-calls/[id] - Update a video call
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const callId = searchParams.get("id")

    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateVideoCallSchema.parse(body)

    // Check if user has access to this video call
    const existingCall = await prisma.videoCall.findUnique({
      where: { id: callId },
    })

    if (!existingCall) {
      return NextResponse.json({ error: "Video call not found" }, { status: 404 })
    }

    if (existingCall.hostId !== session.user.id && existingCall.participantId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedCall = await prisma.videoCall.update({
      where: { id: callId },
      data: {
        ...validatedData,
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : undefined,
        ...(validatedData.status === "IN_PROGRESS" && { startedAt: new Date() }),
        ...(validatedData.status === "COMPLETED" && { endedAt: new Date() }),
      },
      include: {
        host: {
          select: { id: true, name: true, email: true, image: true },
        },
        participant: {
          select: { id: true, name: true, email: true, image: true },
        },
        case: {
          select: { id: true, title: true },
        },
      },
    })

    return NextResponse.json(updatedCall)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating video call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
