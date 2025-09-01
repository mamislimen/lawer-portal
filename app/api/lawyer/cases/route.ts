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

    // Get cases for this lawyer
    const cases = await prisma.case.findMany({
      where: { lawyerId: session.user.id },
      include: {
        client: {
          select: { name: true, email: true }
        },
        casePricing: {
          select: { id: true, status: true, totalEstimate: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedCases = cases.map(caseItem => ({
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      priority: caseItem.priority,
      clientName: caseItem.client.name || 'Unknown Client',
      clientEmail: caseItem.client.email,
      createdAt: caseItem.createdAt.toISOString(),
      hasPricing: caseItem.casePricing.length > 0,
      pricingStatus: caseItem.casePricing[0]?.status || null,
      currentPrice: caseItem.casePricing[0]?.totalEstimate || null
    }))

    return NextResponse.json(formattedCases)
  } catch (error) {
    console.error('Error fetching lawyer cases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
