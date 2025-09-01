import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update pricing status to SENT
    const casePricing = await prisma.casePricing.update({
      where: {
        id: params.id,
        lawyerId: session.user.id
      },
      data: {
        status: 'SENT',
        sentAt: new Date()
      },
      include: {
        case: {
          include: {
            client: true
          }
        }
      }
    })

    // Create notification for client
    await prisma.notification.create({
      data: {
        userId: casePricing.case.clientId,
        title: 'Case Quote Ready for Payment',
        message: `Your quote for case "${casePricing.case.title}" is ready - $${casePricing.totalEstimate.toFixed(2)}. You can now review and pay in your dashboard.`,
        type: 'GENERAL',
        referenceId: casePricing.id
      }
    })

    return NextResponse.json({ success: true, casePricing })
  } catch (error) {
    console.error('Error sending case pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
