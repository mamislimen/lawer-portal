import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all video calls where the current user is either the host or participant
    const videoCalls = await prisma.videoCall.findMany({
      where: {
        OR: [
          { hostId: session.user.id },
          { participantId: session.user.id }
        ]
      },
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        case: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'desc'
      }
    })

    return NextResponse.json(videoCalls)
  } catch (error) {
    console.error('Error fetching video calls:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // Update the video call
    const updatedCall = await prisma.videoCall.update({
      where: { id },
      data: body,
      include: {
        participant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        case: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(updatedCall)
  } catch (error) {
    console.error('Error updating video call:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
