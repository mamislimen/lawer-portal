"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Download, CreditCard, AlertCircle, Loader2, Plus, FileText, Clock, RefreshCw } from "lucide-react"
import { useBilling } from "@/hooks/useBilling"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCardForm } from "@/components/billing/CreditCardForm"
import { PaymentDialog } from "@/components/billing/PaymentDialog"
import { SummaryCard } from "@/components/billing/SummaryCard"
import { loadStripe } from "@stripe/stripe-js";


// Type for Stripe
type StripeInstance = any

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

export default function ClientBillingPage() {
  const router = useRouter()
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState<any>(null)
  const { invoices, timeEntries, isLoading, error, refetch } = useBilling()

  // Summary calculations
  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalPending = invoices
    .filter((inv) => ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalHours = timeEntries
    .filter((te) => te.status === "PENDING")
    .reduce((sum, te) => sum + (te.hours || 0), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200"
      case "SENT":
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) =>
    status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")

  const handlePaymentSuccess = () => {
    refetch()
    setPaymentInvoice(null)
    toast.success("Payment processed successfully!")
  }

  const handleAddCardSuccess = () => {
    setShowAddCard(false)
    toast.success("Payment method added successfully!")
  }

  const handlePayInvoice = (invoice: any) => {
    setPaymentInvoice(invoice)
  }

  const loadStripe = async (publishableKey: string): Promise<StripeInstance | null> => {
    try {
      const { loadStripe: loadStripeJS } = await import("@stripe/stripe-js")
      return await loadStripeJS(publishableKey)
    } catch (err) {
      console.error("Failed to load Stripe:", err)
      return null
    }
  }

  const handlePayNow = async (invoiceId: string) => {
    if (!stripePublishableKey) {
      toast.error("Payment processing is not configured")
      return
    }

    try {
      setIsProcessingPayment(invoiceId)

      const response = await fetch("/api/client/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process payment")
      }

      const { clientSecret } = await response.json()
      const stripe = await loadStripe(stripePublishableKey)
      if (!stripe) throw new Error("Failed to load payment processor")

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret)
      if (stripeError) throw stripeError

      refetch()
      toast.success("Payment successful!")
    } catch (err: any) {
      console.error("Payment error:", err)
      toast.error(err.message || "Failed to process payment")
    } finally {
      setIsProcessingPayment(null)
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Error loading billing information. Please try again.</span>
      </div>
    )

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices and payment methods</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setShowAddCard(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Statements
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total Paid" value={formatCurrency(totalPaid)} description="All time payments" icon={<DollarSign className="h-4 w-4" />} />
        <SummaryCard
          title="Pending Payments"
          value={formatCurrency(totalPending)}
          description={`Across ${invoices.filter((inv) => ["SENT", "OVERDUE"].includes(inv.status)).length} invoices`}
          icon={<FileText className="h-4 w-4" />}
        />
        <SummaryCard title="Tracked Hours" value={totalHours.toFixed(1)} description="Pending time entries" icon={<Clock className="h-4 w-4" />} />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>View and manage your invoices</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No invoices</h3>
              <p className="text-sm text-muted-foreground">You don't have any invoices yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
                      <TableCell>{format(parseISO(invoice.issueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className={invoice.status === "OVERDUE" ? "text-red-500 font-medium" : ""}>
                        {format(parseISO(invoice.dueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{formatCurrency(invoice.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)} variant="outline">
                          {getStatusText(invoice.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/api/invoices/${invoice.id}/download`, "_blank")}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {invoice.status !== "PAID" && (
                            <Button size="sm" onClick={() => handlePayInvoice(invoice)} disabled={isProcessingPayment === invoice.id}>
                              {isProcessingPayment === invoice.id ? (
                                <span>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </span>
                              ) : (
                                <span>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay
                                </span>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Card Dialog */}
      <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>Add a new credit or debit card to your account</DialogDescription>
          </DialogHeader>
          <CreditCardForm onSuccess={handleAddCardSuccess} />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      {paymentInvoice && (
        <PaymentDialog open={!!paymentInvoice} onOpenChange={(open) => !open && setPaymentInvoice(null)} invoice={paymentInvoice} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  )
}
