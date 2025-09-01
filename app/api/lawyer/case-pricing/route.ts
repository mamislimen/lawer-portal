import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a lawyer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get case pricing for this lawyer
    const casePricings = await prisma.casePricing.findMany({
      where: { lawyerId: session.user.id },
      include: {
        case: {
          select: {
            title: true,
            client: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedPricings = casePricings.map(pricing => ({
      id: pricing.id,
      caseId: pricing.caseId,
      caseTitle: pricing.case.title,
      clientName: pricing.case.client.name || 'Unknown Client',
      basePrice: pricing.basePrice,
      hourlyRate: pricing.hourlyRate,
      estimatedHours: pricing.estimatedHours,
      totalEstimate: pricing.totalEstimate,
      description: pricing.description,
      status: pricing.status,
      createdAt: pricing.createdAt.toISOString()
    }))

    return NextResponse.json(formattedPricings)
  } catch (error) {
    console.error('Error fetching case pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { caseId, basePrice, hourlyRate, estimatedHours, description } = body

    // Validate the case belongs to this lawyer and get client info
    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        lawyerId: session.user.id
      },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!caseExists) {
      return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 })
    }

    const totalEstimate = basePrice + (hourlyRate * estimatedHours)

    const casePricing = await prisma.casePricing.create({
      data: {
        caseId,
        lawyerId: session.user.id,
        basePrice,
        hourlyRate,
        estimatedHours,
        totalEstimate,
        description,
        status: 'DRAFT'
      }
    })

    // Create notification for client about new pricing
    await prisma.notification.create({
      data: {
        userId: caseExists.clientId,
        title: 'New Case Quote Available',
        message: `You have received a new quote for case "${caseExists.title}" - $${totalEstimate.toFixed(2)}`,
        type: 'GENERAL',
        referenceId: casePricing.id
      }
    })

    return NextResponse.json(casePricing, { status: 201 })
  } catch (error) {
    console.error('Error creating case pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
