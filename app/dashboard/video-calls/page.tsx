"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Video, Calendar, Clock, Search, Loader2, User, Users, Phone } from "lucide-react"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { VideoCallRoom } from "./components/VideoCallRoom"

type VideoCall = {
  id: string
  title: string
  description: string | null
  hostId: string
  participantId: string
  caseId: string | null
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledAt: string
  startedAt: string | null
  endedAt: string | null
  duration: number | null
  recordingUrl: string | null
  agoraChannelName: string
  participant: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  case?: {
    id: string
    title: string
  } | null
}

export default function VideoCallsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  
  const [calls, setCalls] = useState<VideoCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null)
  const [isJoiningCall, setIsJoiningCall] = useState(false)

  // Fetch video calls from the API
  useEffect(() => {
    const fetchVideoCalls = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/dashboard/video-calls')
        if (!response.ok) {
          throw new Error('Failed to fetch video calls')
        }
        const data = await response.json()
        setCalls(data)
      } catch (err) {
        console.error('Error fetching video calls:', err)
        toast.error('Failed to load video calls. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchVideoCalls()
    }
  }, [session?.user?.id])

  const filteredCalls = calls.filter(
    (call) =>
      call.participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.case?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: VideoCall['status']) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "IN_PROGRESS":
        return "bg-green-100 text-green-800 border-green-200"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: VideoCall['status']) => {
    switch (status) {
      case "SCHEDULED":
        return "Scheduled"
      case "IN_PROGRESS":
        return "In Progress"
      case "COMPLETED":
        return "Completed"
      case "CANCELLED":
        return "Cancelled"
      default:
        return status
    }
  }

  const joinCall = async (call: VideoCall) => {
    try {
      setIsJoiningCall(true)
      
      // Generate a unique user ID for Agora
      const userId = session?.user?.id || Math.floor(Math.random() * 10000)
      
      // Get Agora token from our API
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: call.agoraChannelName,
          uid: userId,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to join call')
      }
      
      const { token } = await response.json()
      
      // Update call status to IN_PROGRESS if it's not already
      if (call.status !== 'IN_PROGRESS') {
        await fetch(`/api/dashboard/video-calls/${call.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'IN_PROGRESS',
            startedAt: new Date().toISOString(),
          }),
        })
      }
      
      setActiveCall(call)
      
    } catch (error) {
      console.error('Error joining call:', error)
      toast.error('Failed to join the call. Please try again.')
    } finally {
      setIsJoiningCall(false)
    }
  }
  
  const endCall = async () => {
    if (!activeCall) return
    
    try {
      // Update call status to COMPLETED
      await fetch(`/api/dashboard/video-calls/${activeCall.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          endedAt: new Date().toISOString(),
          duration: Math.floor((new Date().getTime() - new Date(activeCall.startedAt || new Date()).getTime()) / 1000),
        }),
      })
      
      // Refresh calls list
      const response = await fetch('/api/dashboard/video-calls')
      if (response.ok) {
        const data = await response.json()
        setCalls(data)
      }
      
    } catch (error) {
      console.error('Error ending call:', error)
      toast.error('Failed to end the call properly. Please try again.')
    } finally {
      setActiveCall(null)
    }
  }
  
  const leaveCall = () => {
    setActiveCall(null)
  }

  // If there's an active call, show the call interface
  if (activeCall) {
    return (
      <VideoCallRoom
        channelName={activeCall.agoraChannelName}
        userId={session?.user?.id || 'anonymous'}
        onLeave={leaveCall}
        onEndCall={endCall}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Video Calls</h1>
          <p className="text-muted-foreground text-lg">Schedule and manage video consultations with your clients.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => {
              // For instant calls, create a new call with the current timestamp as the channel name
              const channelName = `instant-${Date.now()}`
              const newCall = {
                id: `temp-${Date.now()}`,
                title: 'Instant Call',
                description: 'Instant video call',
                agoraChannelName: channelName,
                status: 'IN_PROGRESS' as const,
                scheduledAt: new Date().toISOString(),
                hostId: session?.user?.id || '',
                participantId: '',
                caseId: null,
                startedAt: new Date().toISOString(),
                endedAt: null,
                duration: null,
                recordingUrl: null,
                participant: {
                  id: '',
                  name: 'Instant Call',
                  email: '',
                  image: null
                }
              }
              setActiveCall(newCall)
            }}
          >
            <Video className="h-4 w-4" />
            Start Instant Call
          </Button>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Call
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Video Call</DialogTitle>
                <DialogDescription>Schedule a video consultation with your client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input id="date" type="date" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input id="time" type="time" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Call Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="case-review">Case Review</SelectItem>
                      <SelectItem value="mediation">Mediation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setIsScheduleDialogOpen(false)}>
                  Schedule Call
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calls.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calls.filter((c) => c.status === "SCHEDULED").length}</div>
            <p className="text-xs text-muted-foreground">Upcoming calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calls.filter((c) => c.status === "COMPLETED").length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.25</div>
            <p className="text-xs text-muted-foreground">Hours this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Calls Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">
                    {call.participant?.name || 'Unknown User'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(call.scheduledAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : 'N/A'}
                  </TableCell>
                  <TableCell>{call.case?.title || 'No case'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(call.status)}>
                      {getStatusText(call.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {call.status === "SCHEDULED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => joinCall(call)}
                          disabled={isJoiningCall}
                        >
                          {isJoiningCall ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Phone className="h-4 w-4 mr-2" />
                          )}
                          {isJoiningCall ? 'Joining...' : 'Join Call'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
