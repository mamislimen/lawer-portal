import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface TimeEntry {
  id: string
  date: string
  description: string
  hours: number
  rate: number
  amount: number
  status: string
  case?: {
    id: string
    title: string
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  status: string
  total: number
  case?: {
    id: string
    title: string
  }
}

export function useBilling() {
  const { data: session } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchBillingData = useCallback(async () => {
    if (!session?.user?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch invoices, time entries, and payment methods in parallel
      const [invoicesRes, timeEntriesRes, paymentMethodsRes] = await Promise.all([
        fetch('/api/billing/invoices'),
        fetch('/api/billing/time-entries'),
        fetch('/api/billing/payment-methods')
      ])

      if (!invoicesRes.ok) throw new Error("Failed to fetch invoices")
      if (!timeEntriesRes.ok) throw new Error("Failed to fetch time entries")
      if (!paymentMethodsRes.ok) throw new Error("Failed to fetch payment methods")

      const [invoicesData, timeEntriesData, paymentMethodsData] = await Promise.all([
        invoicesRes.json(),
        timeEntriesRes.json(),
        paymentMethodsRes.json()
      ])

      setInvoices(invoicesData)
      setTimeEntries(timeEntriesData)
      setPaymentMethods(paymentMethodsData)
    } catch (err) {
      console.error("Error fetching billing data:", err)
      setError(err instanceof Error ? err : new Error("An unknown error occurred"))
      
      toast({
        title: "Error",
        description: "Failed to load billing data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, toast])
  
  const addPaymentMethod = async (cardData: any) => {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      })
      
      if (!response.ok) throw new Error('Failed to add payment method')
      
      const newPaymentMethod = await response.json()
      setPaymentMethods(prev => [...prev, newPaymentMethod])
      
      toast({
        title: "Success",
        description: "Payment method added successfully",
        variant: "default"
      })
      
      return newPaymentMethod
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }
  
  const payInvoice = async (invoiceId: string, paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })
      
      if (!response.ok) throw new Error('Payment failed')
      
      const updatedInvoice = await response.json()
      setInvoices(prev => 
        prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv)
      )
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${updatedInvoice.amount} processed successfully`,
        variant: "default"
      })
      
      return updatedInvoice
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  useEffect(() => {
    fetchBillingData()
  }, [session?.user?.id])

  return {
    invoices,
    timeEntries,
    paymentMethods,
    isLoading,
    error,
    refetch: fetchBillingData,
    addPaymentMethod,
    payInvoice
  }
}
