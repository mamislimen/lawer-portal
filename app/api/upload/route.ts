import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("caseId") as string
    const documentType = (formData.get("type") as string) || "OTHER"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // If caseId is provided, verify user has access
    if (caseId) {
      const caseAccess = await prisma.case.findFirst({
        where: {
          id: caseId,
          OR: [{ lawyerId: session.user.id }, { clientId: session.user.id }],
        },
      })

      if (!caseAccess) {
        return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 })
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "legal-portal",
            public_id: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`,
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
        .end(buffer)
    })) as any

    // Save document record to database
    const document = await prisma.document.create({
      data: {
        filename: uploadResult.public_id,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: uploadResult.secure_url,
        uploaderId: session.user.id,
        caseId: caseId || null,
        type: documentType as any,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
        case: {
          select: { id: true, title: true },
        },
      },
    })

    // Create notification if document is associated with a case
    if (caseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: caseId },
        include: {
          lawyer: { select: { id: true } },
          client: { select: { id: true } },
        },
      })

      if (caseData) {
        const notifyUserId = session.user.id === caseData.lawyerId ? caseData.clientId : caseData.lawyerId

        await prisma.notification.create({
          data: {
            userId: notifyUserId,
            title: "New Document Uploaded",
            message: `A new document "${file.name}" has been uploaded to case "${caseData.title}"`,
            type: "DOCUMENT",
          },
        })
      }
    }

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/upload - Get documents for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("caseId")
    const type = searchParams.get("type")

    const where: any = {}

    if (caseId) {
      // Verify user has access to the case
      const caseAccess = await prisma.case.findFirst({
        where: {
          id: caseId,
          OR: [{ lawyerId: session.user.id }, { clientId: session.user.id }],
        },
      })

      if (!caseAccess) {
        return NextResponse.json({ error: "Case not found or access denied" }, { status: 404 })
      }

      where.caseId = caseId
    } else {
      // Get documents uploaded by user or in cases they have access to
      const userCases = await prisma.case.findMany({
        where: {
          OR: [{ lawyerId: session.user.id }, { clientId: session.user.id }],
        },
        select: { id: true },
      })

      const caseIds = userCases.map((c) => c.id)

      where.OR = [{ uploaderId: session.user.id }, { caseId: { in: caseIds } }]
    }

    if (type) {
      where.type = type
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
        case: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/upload/[id] - Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("id")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Find the document and verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        case: {
          include: {
            lawyer: { select: { id: true } },
            client: { select: { id: true } },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if user can delete this document
    const canDelete =
      document.uploaderId === session.user.id ||
      (document.case && (document.case.lawyerId === session.user.id || document.case.clientId === session.user.id))

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized to delete this document" }, { status: 401 })
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.filename)
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError)
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    })

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
