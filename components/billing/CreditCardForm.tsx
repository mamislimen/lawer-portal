"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

type CreditCardFormProps = {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: {
    cardNumber?: string
    cardHolder?: string
    expiryMonth?: string
    expiryYear?: string
    cvc?: string
  }
}

export function CreditCardForm({ onSuccess, onCancel, defaultValues }: CreditCardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    cardNumber: defaultValues?.cardNumber?.replace(/\s+/g, '') || '',
    cardHolder: defaultValues?.cardHolder || '',
    expiryMonth: defaultValues?.expiryMonth || '',
    expiryYear: defaultValues?.expiryYear || '',
    cvc: defaultValues?.cvc || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call to save card
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "Credit card saved successfully",
      })
      
      onSuccess?.()
    } catch (error) {
      console.error("Error saving card:", error)
      toast({
        title: "Error",
        description: "Failed to save credit card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches?.[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    return parts.length ? parts.join(' ') : ''
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      cardNumber: formatCardNumber(value)
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Add Payment Method</CardTitle>
          <CardDescription>Add a new credit or debit card to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardHolder">Cardholder Name</Label>
            <Input
              id="cardHolder"
              placeholder="John Doe"
              value={formData.cardHolder}
              onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={formData.expiryMonth}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(month => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={formData.expiryYear}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">Security Code</Label>
              <Input
                id="cvc"
                placeholder="CVC"
                value={formData.cvc}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setFormData(prev => ({ ...prev, cvc: value }))
                }}
                maxLength={4}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Card
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
