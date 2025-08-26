import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    
    // First, get user with their notification preferences ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        notificationPrefsId: true
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    let updatedPreferences
    
    if (user.notificationPrefsId) {
      // Update existing preferences
      updatedPreferences = await prisma.notificationPreferences.update({
        where: { id: user.notificationPrefsId },
        data: {
          email: data.email,
          sms: data.sms,
          caseUpdates: data.caseUpdates,
          appointmentReminders: data.appointmentReminders,
          reminderTime: data.reminderTime
        },
        select: {
          id: true,
          email: true,
          sms: true,
          caseUpdates: true,
          appointmentReminders: true,
          reminderTime: true,
          updatedAt: true
        }
      })
    } else {
      // Create new preferences and link to user
      updatedPreferences = await prisma.$transaction(async (tx) => {
        const prefs = await tx.notificationPreferences.create({
          data: {
            email: data.email ?? true,
            sms: data.sms ?? false,
            caseUpdates: data.caseUpdates ?? true,
            appointmentReminders: data.appointmentReminders ?? true,
            reminderTime: data.reminderTime ?? '24h',
            user: {
              connect: { id: session.user.id }
            }
          },
          select: {
            id: true,
            email: true,
            sms: true,
            caseUpdates: true,
            appointmentReminders: true,
            reminderTime: true,
            updatedAt: true
          }
        })

        return prefs
      })
    }

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
