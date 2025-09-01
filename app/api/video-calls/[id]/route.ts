import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateVideoCallSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  duration: z.number().optional(),
  scheduledAt: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const callId = params.id
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const callId = params.id
    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 })
    }

    const videoCall = await prisma.videoCall.findUnique({
      where: { id: callId },
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

    if (!videoCall) {
      return NextResponse.json({ error: "Video call not found" }, { status: 404 })
    }

    if (videoCall.hostId !== session.user.id && videoCall.participantId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(videoCall)
  } catch (error) {
    console.error("Error fetching video call:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
