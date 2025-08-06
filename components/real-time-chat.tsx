"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Video } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  caseId?: string
  type: "TEXT" | "FILE" | "IMAGE" | "SYSTEM"
  createdAt: string
  readAt?: string
  sender: {
    id: string
    name: string
    email: string
    image?: string
  }
  receiver: {
    id: string
    name: string
    email: string
    image?: string
  }
  case?: {
    id: string
    title: string
  }
}

interface RealTimeChatProps {
  caseId?: string
  otherUserId?: string
  otherUserName?: string
  otherUserImage?: string
}

export default function RealTimeChat({ caseId, otherUserId, otherUserName, otherUserImage }: RealTimeChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages
  useEffect(() => {
    if (!session?.user || (!caseId && !otherUserId)) return

    const loadMessages = async () => {
      try {
        const params = new URLSearchParams()
        if (caseId) params.append("caseId", caseId)
        if (otherUserId) params.append("userId", otherUserId)

        const response = await fetch(`/api/messages?${params}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    loadMessages()
  }, [session, caseId, otherUserId])

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !session?.user || (!caseId && !otherUserId)) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage.trim(),
          receiverId: otherUserId,
          caseId: caseId,
          type: "TEXT",
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        inputRef.current?.focus()
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle typing indicator
  const handleTyping = () => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  // Start video call
  const startVideoCall = async () => {
    if (!otherUserId) return

    try {
      const response = await fetch("/api/video-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Video Call with ${otherUserName}`,
          participantId: otherUserId,
          caseId: caseId,
          scheduledAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const videoCall = await response.json()
        window.open(`/video-call/${videoCall.id}`, "_blank")
      } else {
        throw new Error("Failed to start video call")
      }
    } catch (error) {
      console.error("Error starting video call:", error)
      toast({
        title: "Error",
        description: "Failed to start video call",
        variant: "destructive",
      })
    }
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please sign in to use the chat feature.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={otherUserImage || "/placeholder.svg"} />
              <AvatarFallback>{otherUserName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName || "Chat"}</CardTitle>
              {isTyping && (
                <Badge variant="secondary" className="text-xs">
                  Typing...
                </Badge>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={startVideoCall} disabled={!otherUserId}>
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === session.user.id
                const sender = isOwn ? message.sender : message.receiver

                return (
                  <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`flex space-x-2 max-w-[70%] ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={sender.image || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {sender.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className={`space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`px-3 py-2 rounded-lg ${
                            isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                          {isOwn && message.readAt && (
                            <Badge variant="secondary" className="text-xs">
                              Read
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                handleTyping()
              }}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
