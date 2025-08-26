import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface CreditCardFormProps {
  onSuccess: () => void
}

export function CreditCardForm({ onSuccess }: CreditCardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardDetails, setCardDetails] = useState<{
    number: string
    expiry: string
    cvc: string
    name: string
  }>({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Format card data for the API
      const [expiryMonth, expiryYear] = cardDetails.expiry.split('/').map(part => part.trim())
      const expiryDate = new Date(parseInt(expiryYear), parseInt(expiryMonth) - 1)
      
      const cardData = {
        cardNumber: cardDetails.number.replace(/\s+/g, ''),
        expiryMonth: expiryMonth,
        expiryYear: expiryYear,
        cvc: cardDetails.cvc,
        cardHolderName: cardDetails.name,
        brand: getCardBrand(cardDetails.number),
        last4: cardDetails.number.replace(/\s+/g, '').slice(-4),
        expiryDate: expiryDate
      }
      
      // Call the API to save the payment method
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      })
      
      if (!response.ok) throw new Error('Failed to save payment method')
      
      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Payment method added successfully",
        variant: "default"
      })
      
      onSuccess()
    } catch (error) {
      console.error("Error adding card:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payment method. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Helper function to determine card brand
  const getCardBrand = (number: string): string => {
    const cardNumber = number.replace(/\D/g, '')
    
    if (/^4/.test(cardNumber)) return 'visa'
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard'
    if (/^3[47]/.test(cardNumber)) return 'amex'
    if (/^3(?:0[0-5]|[68][0-9])/.test(cardNumber)) return 'diners'
    if (/^6(?:011|5)/.test(cardNumber)) return 'discover'
    if (/^(?:2131|1800|35\d{3})/.test(cardNumber)) return 'jcb'
    
    return 'unknown'
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Format card number with spaces (e.g., 4242 4242 4242 4242)
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts: string[] = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    if (parts.length) {
      return parts.join(' ')
    }
    return value
  }
  
  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    
    if (v.length >= 3) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }
  
  // Format CVC (3-4 digits)
  const formatCVC = (value: string): string => {
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 4)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Add Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="number"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formatCardNumber(cardDetails.number)}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value)
                setCardDetails(prev => ({
                  ...prev,
                  number: formatted
                }))
              }}
              required
              maxLength={19} // 16 digits + 3 spaces
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                name="expiry"
                type="text"
                placeholder="MM/YY"
                value={formatExpiryDate(cardDetails.expiry)}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value)
                  setCardDetails(prev => ({
                    ...prev,
                    expiry: formatted
                  }))
                }}
                required
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                name="cvc"
                type="text"
                placeholder="123"
                value={formatCVC(cardDetails.cvc)}
                onChange={(e) => {
                  const formatted = formatCVC(e.target.value)
                  setCardDetails(prev => ({
                    ...prev,
                    cvc: formatted
                  }))
                }}
                required
                maxLength={4}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name on Card</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={cardDetails.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Payment Method'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
function setCardDetails(arg0: (prev: any) => any) {
    throw new Error("Function not implemented.")
}

