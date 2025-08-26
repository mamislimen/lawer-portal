import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { clientId: session.user.id },
      include: {
        case: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[INVOICES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { caseId, issueDate, dueDate, items, notes } = await req.json()

    // Calculate amounts
    const subtotal = items.reduce((sum: number, item: { amount: number; quantity?: number }) => sum + (item.amount * (item.quantity || 1)), 0);
    const tax = 0; // You might want to calculate tax based on subtotal
    const discount = 0; // Apply any discounts here
    const total = subtotal + tax - discount;

    // First, get the case to get the lawyerId
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      select: { lawyerId: true }
    });

    if (!caseData) {
      return new NextResponse("Case not found", { status: 404 });
    }

    // Generate invoice number (you might want to use a more sophisticated method)
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: session.user.id,
        lawyerId: caseData.lawyerId,
        caseId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subtotal,
        tax,
        discount,
        total,
        status: 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            amount: item.amount,
            quantity: item.quantity || 1,
          })),
        },
        notes,
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("[INVOICE_CREATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
