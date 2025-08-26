import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    // Get the invoice with items
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        clientId: session.user.id,
      },
      include: {
        items: true,
        case: {
          select: {
            title: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            email: true,
            name: true,
            stripeAccountId: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      )
    }

    // Create a payment intent with Stripe Connect for direct charges
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        invoiceId: invoice.id,
        clientId: session.user.id,
        caseId: invoice.caseId,
      },
      // For Stripe Connect, transfer to the lawyer's connected account
      ...(invoice.lawyer.stripeAccountId && {
        transfer_data: {
          destination: invoice.lawyer.stripeAccountId,
        },
      }),
      description: `Payment for invoice ${invoice.invoiceNumber} - ${invoice.case?.title || 'Legal Services'}`,
    })

    // Create a payment record in our database
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        paymentDate: new Date(),
        paymentMethod: "STRIPE",
        stripePaymentIntentId: paymentIntent.id,
        transactionId: paymentIntent.id,
        notes: 'Payment initiated via Stripe',
      },
    })

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    )
  }
}
