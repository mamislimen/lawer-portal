import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { basePrice, hourlyRate, estimatedHours, description } = body

    const totalEstimate = basePrice + (hourlyRate * estimatedHours)

    const casePricing = await prisma.casePricing.update({
      where: {
        id: params.id,
        lawyerId: session.user.id
      },
      data: {
        basePrice,
        hourlyRate,
        estimatedHours,
        totalEstimate,
        description
      }
    })

    return NextResponse.json(casePricing)
  } catch (error) {
    console.error('Error updating case pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.casePricing.delete({
      where: {
        id: params.id,
        lawyerId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
