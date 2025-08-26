import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AppointmentStatus, AppointmentType } from '@prisma/client'

export async function GET() {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)

    // Check if user is authenticated and is a lawyer
    if (!session?.user?.id || session.user.role !== 'LAWYER') {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'You must be signed in as a lawyer to access this resource.'
        }), 
        { status: 401 }
      )
    }

    // Get the lawyer's ID from the session
    const lawyerId = session.user.lawyerId
    
    if (!lawyerId) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Not Found',
          message: 'Lawyer profile not found.'
        }), 
        { status: 404 }
      )
    }

    // Fetch appointments for the lawyer
    const appointments = await prisma.appointment.findMany({
      where: {
        lawyerId: lawyerId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
        startTime: 'desc',
      },
    })

    // Return the appointments
    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching lawyer appointments:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An error occurred while fetching appointments.'
      }), 
      { status: 500 }
    )
  }
}
