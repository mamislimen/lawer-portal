import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    // Check if user has client role
    if (session.user.role !== 'CLIENT') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return new NextResponse(
        JSON.stringify({ error: 'First name, last name, and email are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Check if client with this email already exists
    const existingClient = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingClient) {
      return new NextResponse(
        JSON.stringify({ error: 'A client with this email already exists' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Create new client user with client profile
    const client = await prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        role: 'CLIENT',
        clientProfile: {
          create: {
            phone: data.phone || null,
            address: data.address || null,
            company: data.notes ? data.notes.substring(0, 255) : null, // Using company field for notes
          },
        },
      },
      include: {
        clientProfile: true,
      },
    })

    return new NextResponse(JSON.stringify(client), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
