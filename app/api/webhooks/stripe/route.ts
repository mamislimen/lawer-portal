import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handlePaymentSuccess(session)
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session
        await handlePaymentExpired(expiredSession)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  try {
    const { quoteId, clientId, lawyerId } = session.metadata!

    // Update payment intent
    await prisma.paymentIntent.update({
      where: { stripeSessionId: session.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date()
      }
    })

    // Update case pricing
    const casePricing = await prisma.casePricing.update({
      where: { id: quoteId },
      data: {
        status: 'PAID',
        paidAt: new Date()
      },
      include: {
        case: {
          select: { title: true }
        }
      }
    })

    // Create notifications
    await Promise.all([
      // Notify lawyer
      prisma.notification.create({
        data: {
          userId: lawyerId,
          title: 'Payment Received',
          message: `Payment of $${casePricing.totalEstimate.toFixed(2)} received for case "${casePricing.case.title}"`,
          type: 'PAYMENT_RECEIVED',
          referenceId: quoteId
        }
      }),
      // Notify client
      prisma.notification.create({
        data: {
          userId: clientId,
          title: 'Payment Confirmed',
          message: `Your payment of $${casePricing.totalEstimate.toFixed(2)} for case "${casePricing.case.title}" has been confirmed`,
          type: 'PAYMENT_RECEIVED',
          referenceId: quoteId
        }
      })
    ])

    console.log(`Payment completed for quote ${quoteId}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentExpired(session: Stripe.Checkout.Session) {
  try {
    // Update payment intent status
    await prisma.paymentIntent.update({
      where: { stripeSessionId: session.id },
      data: { status: 'CANCELED' }
    })

    console.log(`Payment session expired: ${session.id}`)
  } catch (error) {
    console.error('Error handling payment expiration:', error)
  }
}
