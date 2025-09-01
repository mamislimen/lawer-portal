import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, quoteId } = body

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    // Update payment intent status using raw query
    await prisma.$executeRaw`
      UPDATE "PaymentIntent" 
      SET status = 'COMPLETED', "paidAt" = ${new Date()}
      WHERE "stripeSessionId" = ${sessionId}
    `

    // Update case pricing status and get case info using raw query
    await prisma.$executeRaw`
      UPDATE "CasePricing" 
      SET status = 'PAID', "paidAt" = ${new Date()}
      WHERE id = ${quoteId}
    `

    const casePricingResult = await prisma.$queryRaw`
      SELECT cp.*, c.title as caseTitle, c."lawyerId"
      FROM "CasePricing" cp
      JOIN "Case" c ON cp."caseId" = c.id
      WHERE cp.id = ${quoteId}
    ` as any[]
    
    const casePricing = casePricingResult[0]

    // Create notification for lawyer
    await prisma.notification.create({
      data: {
        userId: casePricing.lawyerId,
        title: 'Payment Received',
        message: `Payment of $${parseFloat(casePricing.totalEstimate).toFixed(2)} received for case "${casePricing.caseTitle}"`,
        type: 'PAYMENT_RECEIVED',
        referenceId: casePricing.id
      }
    })

    return NextResponse.json({
      success: true,
      caseTitle: casePricing.caseTitle,
      amount: parseFloat(casePricing.totalEstimate),
      paidAt: new Date(),
      transactionId: checkoutSession.payment_intent
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
