import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export interface Invoice {
  id: string
  invoiceNumber: string
  caseId: string
  clientId: string
  lawyerId: string
  issueDate: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID' | 'PARTIALLY_PAID'
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  terms?: string
  stripePaymentIntentId?: string
  stripeInvoiceId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  items: InvoiceItem[]
  payments: Payment[]
  case?: {
    id: string
    title: string
  }
  lawyer?: {
    id: string
    name: string | null
    email: string
  }
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  timeEntryId?: string
  createdAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'STRIPE' | 'PAYPAL' | 'OTHER'
  transactionId?: string
  stripePaymentIntentId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TimeEntry {
  id: string
  caseId: string
  lawyerId: string
  date: string
  description: string
  hours: number
  rate: number
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BILLED'
  approvedAt?: string
  approvedById?: string
  createdAt: string
  updatedAt: string
  lawyer?: {
    id: string
    name: string | null
    email: string
  }
  case?: {
    id: string
    title: string
  }
}

export function useBilling() {
  const { data: session } = useSession()

  const fetchInvoices = async () => {
    if (!session?.user) return []
    const res = await fetch('/api/client/billing/invoices')
    if (!res.ok) throw new Error('Failed to fetch invoices')
    return res.json()
  }

  const fetchTimeEntries = async () => {
    if (!session?.user) return []
    const res = await fetch('/api/client/billing/time-entries')
    if (!res.ok) throw new Error('Failed to fetch time entries')
    return res.json()
  }

  const invoicesQuery = useQuery<Invoice[]>({
    queryKey: ['billing', 'invoices', session?.user?.id],
    queryFn: fetchInvoices,
    enabled: !!session?.user,
  })

  const timeEntriesQuery = useQuery<TimeEntry[]>({
    queryKey: ['billing', 'time-entries', session?.user?.id],
    queryFn: fetchTimeEntries,
    enabled: !!session?.user,
  })

  return {
    invoices: invoicesQuery.data || [],
    timeEntries: timeEntriesQuery.data || [],
    isLoading: invoicesQuery.isLoading || timeEntriesQuery.isLoading,
    error: invoicesQuery.error || timeEntriesQuery.error,
    refetch: () => {
      invoicesQuery.refetch()
      timeEntriesQuery.refetch()
    },
  }
}
