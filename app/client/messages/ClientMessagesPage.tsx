"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Search, MessageSquare, Clock, Paperclip, Phone, Video } from "lucide-react"
import useChat, { type Conversation } from "./useChat"
import { useSession } from "next-auth/react"

interface Lawyer {
  id: string
  name: string | null
  title: string
  specialization: string
  online: boolean
  image: string | null
  email?: string
  updatedAt?: Date
  lawyerProfile?: {
    specialization: string[]
    bio?: string
  }
}

export default function ClientMessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [lawyersError, setLawyersError] = useState<string | null>(null)
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isAtBottom, setIsAtBottom] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    messages,
    isLoading,
    isSending,
    sendMessage,
    searchTerm,
    setSearchTerm,
    isConnected,
    loadMoreMessages,
    hasMore,
    isLoadingMore
  } = useChat()

  // Fetch lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch("/api/lawyers")
        if (!response.ok) throw new Error("Failed to fetch lawyers")
        const data: Lawyer[] = await response.json()
        setLawyers(data)
        setLawyersError(null)
      } catch (error) {
        console.error(error)
        setLawyersError("Failed to load lawyers. Please try again later.")
        setLawyers([])
      } finally {
        setIsLoadingLawyers(false)
      }
    }
    fetchLawyers()
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending || !selectedConversation) return

    const success = await sendMessage(newMessage)
    if (success) {
      setNewMessage("")
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100
    setIsAtBottom(isNearBottom)

    if (scrollTop < 100 && hasMore && !isLoading && !isLoadingMore) {
      loadMoreMessages()
    }
  }, [hasMore, isLoading, isLoadingMore, loadMoreMessages])

  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isAtBottom])

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground text-lg">Communicate with your legal team.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="self-start">
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Legal Team</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingLawyers ? (
              <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lawyersError ? (
              <div className="p-4 text-center text-destructive">
                <p>{lawyersError}</p>
                <Button variant="ghost" className="mt-2" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {lawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    className={`flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                      selectedConversation?.lawyer?.id === lawyer.id ? "bg-muted" : ""
                    }`}
                    onClick={() =>
                      setSelectedConversation({
                        id: `lawyer-${lawyer.id}`,
                        lawyer: {
                          id: lawyer.id,
                          name: lawyer.name || "Lawyer",
                          email: lawyer.email || "",
                          image: lawyer.image || "",
                          online: lawyer.online
                        },
                        lastMessage: "",
                        unread: 0,
                        timestamp: new Date().toISOString()
                      })
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={lawyer.image || ""} alt={lawyer.name || "Lawyer"} />
                          <AvatarFallback>
                            {lawyer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                            lawyer.online ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{lawyer.name}</p>
                        <p className="text-sm text-muted-foreground">{lawyer.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={lawyer.online ? "default" : "secondary"}>
                        {lawyer.online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <div className="flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.lawyer.image || ''} alt={selectedConversation.lawyer.name} />
                    <AvatarFallback>
                      {selectedConversation.lawyer.name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.lawyer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.lawyer.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto" ref={messagesContainerRef}>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                        <Skeleton className={`h-8 w-3/4 rounded-lg ${i % 2 === 0 ? 'bg-primary/10' : ''}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div>
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No messages yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Send a message to start the conversation
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isClient ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.isClient ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 text-right ${
                              message.isClient ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newMessage.trim() && selectedConversation) {
                      sendMessage(newMessage);
                      setNewMessage('');
                    }
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newMessage.trim() && selectedConversation) {
                            sendMessage(newMessage);
                            setNewMessage('');
                          }
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="h-10 w-10 p-0"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex h-[600px] flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No conversation selected</h3>
              <p className="text-sm text-muted-foreground">
                Select a lawyer from the list to start chatting
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
