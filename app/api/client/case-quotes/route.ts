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

    // Check if user is a client
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get case quotes for this client using raw query until Prisma is regenerated
    const caseQuotes = await prisma.$queryRaw`
      SELECT cp.*, c.title as caseTitle, u.name as lawyerName
      FROM "CasePricing" cp
      JOIN "Case" c ON cp."caseId" = c.id
      JOIN "User" u ON cp."lawyerId" = u.id
      WHERE c."clientId" = ${session.user.id}
      AND cp.status IN ('SENT', 'ACCEPTED', 'PAID')
      ORDER BY cp."sentAt" DESC
    ` as any[]

    const formattedQuotes = caseQuotes.map((quote: any) => ({
      id: quote.id,
      caseId: quote.caseId,
      caseTitle: quote.caseTitle,
      lawyerName: quote.lawyerName || 'Unknown Lawyer',
      basePrice: parseFloat(quote.basePrice),
      hourlyRate: parseFloat(quote.hourlyRate),
      estimatedHours: parseFloat(quote.estimatedHours),
      totalEstimate: parseFloat(quote.totalEstimate),
      description: quote.description,
      status: quote.status,
      sentAt: quote.sentAt?.toISOString(),
      acceptedAt: quote.acceptedAt?.toISOString(),
      paidAt: quote.paidAt?.toISOString()
    }))

    return NextResponse.json(formattedQuotes)
  } catch (error) {
    console.error('Error fetching case quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
