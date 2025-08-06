"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Search, MessageSquare, Clock, Paperclip, Phone, Video } from "lucide-react"

const mockConversations = [
  {
    id: 1,
    lawyer: "John Doe",
    lastMessage: "I've reviewed your case documents. Let's schedule a meeting to discuss next steps.",
    timestamp: "2024-01-25 14:30",
    unread: 2,
    avatar: "JD",
    online: true,
  },
  {
    id: 2,
    lawyer: "Sarah Wilson (Paralegal)",
    lastMessage: "The court filing has been submitted successfully. You should receive confirmation within 24 hours.",
    timestamp: "2024-01-25 12:15",
    unread: 0,
    avatar: "SW",
    online: false,
  },
]

const mockMessages = [
  {
    id: 1,
    sender: "You",
    content: "Hi John, I wanted to follow up on the property dispute case. Do you have any updates?",
    timestamp: "2024-01-25 14:00",
    isClient: true,
  },
  {
    id: 2,
    sender: "John Doe",
    content: "Hello John! Yes, I have some good news. The opposing party has agreed to mediation.",
    timestamp: "2024-01-25 14:05",
    isClient: false,
  },
  {
    id: 3,
    sender: "You",
    content: "That's great news! What are the next steps? Do I need to prepare anything?",
    timestamp: "2024-01-25 14:10",
    isClient: true,
  },
  {
    id: 4,
    sender: "John Doe",
    content:
      "I'll prepare all the necessary documents. We should meet this week to go over your testimony and strategy.",
    timestamp: "2024-01-25 14:15",
    isClient: false,
  },
  {
    id: 5,
    sender: "John Doe",
    content: "I've reviewed your case documents. Let's schedule a meeting to discuss next steps.",
    timestamp: "2024-01-25 14:30",
    isClient: false,
  },
]

export default function ClientMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConversations = mockConversations.filter((conv) =>
    conv.lawyer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground text-lg">Communicate with your legal team.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockConversations.length}</div>
            <p className="text-xs text-muted-foreground">With your legal team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {mockConversations.reduce((sum, conv) => sum + conv.unread, 0)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockConversations.reduce((sum, conv) => sum + conv.unread, 0)}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2h</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Legal Team</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredConversations.map((conversation) => (
                <div key={conversation.id}>
                  <div
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{conversation.avatar}</AvatarFallback>
                      </Avatar>
                      {conversation.online && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.lawyer}</p>
                        {conversation.unread > 0 && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conversation.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{selectedConversation.avatar}</AvatarFallback>
                  </Avatar>
                  {selectedConversation.online && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div>
                  <CardTitle>{selectedConversation.lawyer}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedConversation.online ? "Online" : "Offline"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isClient ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isClient ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isClient ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
