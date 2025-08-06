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
import { Send, Search, MessageSquare, Users, Clock, Paperclip } from "lucide-react"

const mockConversations = [
  {
    id: 1,
    client: "John Smith",
    lastMessage: "Thank you for the consultation. When can we schedule the next meeting?",
    timestamp: "2024-01-25 14:30",
    unread: 2,
    avatar: "JS",
  },
  {
    id: 2,
    client: "Sarah Johnson",
    lastMessage: "I've reviewed the contract. Can we discuss the terms tomorrow?",
    timestamp: "2024-01-25 12:15",
    unread: 0,
    avatar: "SJ",
  },
  {
    id: 3,
    client: "Michael Brown",
    lastMessage: "The documents have been submitted to the court.",
    timestamp: "2024-01-24 16:45",
    unread: 1,
    avatar: "MB",
  },
]

const mockMessages = [
  {
    id: 1,
    sender: "John Smith",
    content: "Hello, I wanted to follow up on our consultation yesterday.",
    timestamp: "2024-01-25 14:00",
    isClient: true,
  },
  {
    id: 2,
    sender: "You",
    content: "Hi John, thank you for reaching out. I'm glad we could discuss your case in detail.",
    timestamp: "2024-01-25 14:05",
    isClient: false,
  },
  {
    id: 3,
    sender: "John Smith",
    content: "I have a few more questions about the timeline. When would be a good time to schedule our next meeting?",
    timestamp: "2024-01-25 14:10",
    isClient: true,
  },
  {
    id: 4,
    sender: "You",
    content: "I have availability next week. Let me check my calendar and get back to you with some options.",
    timestamp: "2024-01-25 14:15",
    isClient: false,
  },
  {
    id: 5,
    sender: "John Smith",
    content: "Thank you for the consultation. When can we schedule the next meeting?",
    timestamp: "2024-01-25 14:30",
    isClient: true,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredConversations = mockConversations.filter((conv) =>
    conv.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to your backend
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground text-lg">Communicate with your clients in real-time.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockConversations.length}</div>
            <p className="text-xs text-muted-foreground">Active chats</p>
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
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockConversations.length}</div>
            <p className="text-xs text-muted-foreground">Currently messaging</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
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
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{conversation.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversation.client}</p>
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
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{selectedConversation.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{selectedConversation.client}</CardTitle>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {mockMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isClient ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isClient ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isClient ? "text-muted-foreground" : "text-primary-foreground/70"
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
