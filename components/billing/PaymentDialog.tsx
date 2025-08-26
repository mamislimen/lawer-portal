"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CreditCard, Banknote } from "lucide-react"

type PaymentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: {
    id: string
    invoiceNumber: string
    total: number
    dueDate: Date
  }
  onSuccess?: () => void
}

type PaymentMethod = 'credit_card' | 'bank_transfer' | 'other'

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [amount, setAmount] = useState(invoice.total.toString())
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${parseFloat(amount).toFixed(2)} for invoice #${invoice.invoiceNumber} has been processed.`,
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pay Invoice #{invoice.invoiceNumber}</DialogTitle>
            <DialogDescription>
              Complete your payment of ${invoice.total.toFixed(2)} due {new Date(invoice.dueDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Pay</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  max={invoice.total}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Outstanding balance: ${invoice.total.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit/Debit Card</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="other">Other Payment Method</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'credit_card' && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-3">Pay with card</p>
                <div className="space-y-3">
                  <Input placeholder="Card number" className="font-mono tracking-widest" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="MM/YY" className="text-center" />
                    <Input placeholder="CVC" className="text-center" maxLength={4} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${parseFloat(amount).toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
