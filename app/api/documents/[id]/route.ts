import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const documentId = params.id

    // Find the document and verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        case: {
          select: {
            lawyerId: true,
          },
        },
      },
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    if (document?.case?.lawyerId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting document:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
