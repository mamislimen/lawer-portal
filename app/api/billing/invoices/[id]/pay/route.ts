import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { paymentMethodId } = await req.json()
    const invoiceId = params.id

    // Verify the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
        clientId: session.user.id 
      },
    })

    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 })
    }

    if (invoice.status === 'PAID') {
      return new NextResponse("Invoice already paid", { status: 400 })
    }

    // Note: Payment method validation would go here in a production app
    // For now, we'll just use a default payment method

    // In a real app, you would process the payment with Stripe or another processor here
    // For now, we'll just update the invoice status
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
      include: {
        case: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Create a payment record
    await prisma.payment.create({
      data: {
        invoiceId,
        amount: updatedInvoice.total,
        paymentDate: new Date(),
        paymentMethod: 'CREDIT_CARD', // Assuming credit card payment
        stripePaymentIntentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
      },
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("[INVOICE_PAY]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
