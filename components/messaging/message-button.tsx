'use client';

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"

export function MessageButton({ lawyerId, lawyerName }: { lawyerId: string; lawyerName: string }) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  const handleSendMessage = async () => {
    if (!message.trim() || !lawyerId || !session?.user?.id) return
    
    setIsLoading(true)
    try {
      // First, check if a conversation already exists with this lawyer
      const conversationsRes = await fetch('/api/messages/conversations')
      if (!conversationsRes.ok) throw new Error('Failed to fetch conversations')
      
      const conversations = await conversationsRes.json()
      let conversation = conversations.find((conv: any) => 
        conv.user1.id === lawyerId || conv.user2.id === lawyerId
      )
      
      // If no conversation exists, create one
      if (!conversation) {
        const createRes = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: lawyerId })
        })
        
        if (!createRes.ok) throw new Error('Failed to create conversation')
        conversation = await createRes.json()
      }

      // Now send the message in the conversation
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          conversationId: conversation.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Close the dialog and reset the form
      setIsOpen(false)
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Message {lawyerName.split(" ")[0]}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {lawyerName}</DialogTitle>
          <DialogDescription>
            Send a message to {lawyerName}. They'll receive it in their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
