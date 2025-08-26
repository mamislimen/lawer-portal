import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, CreditCard, Banknote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useBilling } from "@/hooks/use-billing"

interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  total: number
  status: string
  [key: string]: any
}

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  isDefault?: boolean
  [key: string]: any
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const { toast } = useToast()
  const { paymentMethods = [] } = useBilling()

  const handleSubmit = async () => {
    if (!invoice || !selectedMethod) return
    
    setIsProcessing(true)
    
    try {
      // Call the API to process the payment
      const response = await fetch(`/api/billing/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paymentMethodId: selectedMethod,
          amount: invoice.total
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment failed')
      }
      
      const result = await response.json()
      
      toast({
        title: "Payment Successful",
        description: `Payment of $${invoice.total.toFixed(2)} has been processed successfully.`,
        variant: "default"
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Invoice #{invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Complete your payment of <span className="font-semibold">${invoice.total.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Invoice Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Invoice #</div>
              <div className="text-right">{invoice.invoiceNumber}</div>
              
              <div className="text-muted-foreground">Date</div>
              <div className="text-right">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </div>
              
              <div className="text-muted-foreground">Due Date</div>
              <div className="text-right">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
              
              <div className="text-muted-foreground">Amount Due</div>
              <div className="text-right font-semibold">
                ${invoice.total.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium">Payment Method</h4>
            {paymentMethods.length > 0 ? (
              <RadioGroup 
                value={selectedMethod || ''}
                onValueChange={setSelectedMethod}
                className="grid gap-2"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted/50">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-0" />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>
                            {method.brand ? `${method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ` : 'Card '}
                            •••• {method.last4}
                          </span>
                        </div>
                        {method.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No payment methods found. Please add a payment method first.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => {
                    onOpenChange(false)
                    // Open add payment method dialog
                    // You'll need to implement this part based on your app's state management
                  }}
                >
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isProcessing || !selectedMethod || paymentMethods.length === 0}
            className="min-w-[100px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${invoice?.total.toFixed(2)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
