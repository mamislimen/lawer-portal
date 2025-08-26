import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { lawyerId: session.user.id },
      include: {
        case: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error("[TIME_ENTRIES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { caseId, date, hours, rate, description } = await req.json()

    const timeEntry = await prisma.timeEntry.create({
      data: {
        lawyerId: session.user.id,
        caseId,
        date: new Date(date),
        hours: parseFloat(hours),
        rate: parseFloat(rate),
        amount: parseFloat(hours) * parseFloat(rate),
        description,
        status: 'PENDING',
      },
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error("[TIME_ENTRY_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
