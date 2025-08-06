import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  clientId: z.string().min(1, "Client ID is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
})

const updateCaseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED", "ON_HOLD"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
})

// GET /api/cases - Get all cases for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const where: any = {}

    // Filter by user role
    if (session.user.role === "LAWYER") {
      where.lawyerId = session.user.id
    } else if (session.user.role === "CLIENT") {
      where.clientId = session.user.id
    }

    // Add filters
    if (status) where.status = status
    if (priority) where.priority = priority

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          lawyer: {
            select: { id: true, name: true, email: true },
          },
          client: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: {
              messages: true,
              documents: true,
              videoCalls: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        cases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "LAWYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCaseSchema.parse(body)

    const newCase = await prisma.case.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        lawyerId: session.user.id,
        clientId: validatedData.clientId,
        priority: validatedData.priority,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
      include: {
        lawyer: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: validatedData.clientId,
        title: "New Case Created",
        message: `A new case "${validatedData.title}" has been created for you`,
        type: "INFO",
      },
    })

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/cases/[id] - Update a case
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("id")

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateCaseSchema.parse(body)

    // Check if user has access to this case
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    if (session.user.role === "LAWYER" && existingCase.lawyerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === "CLIENT" && existingCase.clientId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
      include: {
        lawyer: {
          select: { id: true, name: true, email: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(updatedCase)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating case:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
