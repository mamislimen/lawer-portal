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

    // Verify the quote belongs to this client using raw query
    const casePricingResult = await prisma.$queryRaw`
      SELECT cp.*, c.title as caseTitle, c."lawyerId", c."clientId"
      FROM "CasePricing" cp
      JOIN "Case" c ON cp."caseId" = c.id
      WHERE cp.id = ${params.id} AND c."clientId" = ${session.user.id}
    ` as any[]
    
    const casePricing = casePricingResult[0]

    if (!casePricing) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (casePricing.status !== 'SENT') {
      return NextResponse.json({ error: 'Quote cannot be accepted' }, { status: 400 })
    }

    // Update quote status to ACCEPTED using raw query
    await prisma.$executeRaw`
      UPDATE "CasePricing" 
      SET status = 'ACCEPTED', "acceptedAt" = ${new Date()}
      WHERE id = ${params.id}
    `

    // Create notification for lawyer
    await prisma.notification.create({
      data: {
        userId: casePricing.lawyerId,
        title: 'Quote Accepted',
        message: `Your quote for case "${casePricing.caseTitle}" has been accepted by the client`,
        type: 'GENERAL',
        referenceId: casePricing.id
      }
    })

    const updatedQuote = { ...casePricing, status: 'ACCEPTED', acceptedAt: new Date() }

    return NextResponse.json({ success: true, quote: updatedQuote })
  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
