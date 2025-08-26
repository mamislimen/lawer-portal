import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Get time entries for the current client's cases
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        case: {
          clientId: session.user.id,
        },
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
      include: {
        lawyer: {
          select: {
            id: true,
            name: true,
            email: true,
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
        date: "desc",
      },
    })

    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 }
    )
  }
}
