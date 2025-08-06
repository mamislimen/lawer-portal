"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Video,
  Calendar,
  Clock,
  Search,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Monitor,
  Settings,
  Play,
} from "lucide-react"

const mockUpcomingCalls = [
  {
    id: 1,
    lawyer: "John Doe",
    lawyerAvatar: "JD",
    specialty: "Corporate Law",
    scheduledTime: "2024-01-26 14:00",
    duration: "60 min",
    type: "Case Strategy Meeting",
    status: "Scheduled",
    meetingLink: "https://meet.example.com/abc123",
    caseRelated: "Property Dispute Case",
  },
  {
    id: 2,
    lawyer: "Sarah Wilson",
    lawyerAvatar: "SW",
    specialty: "Family Law",
    scheduledTime: "2024-01-28 10:00",
    duration: "45 min",
    type: "Document Review",
    status: "Scheduled",
    meetingLink: "https://meet.example.com/def456",
    caseRelated: "Employment Contract Review",
  },
  {
    id: 3,
    lawyer: "Michael Brown",
    lawyerAvatar: "MB",
    specialty: "Personal Injury",
    scheduledTime: "2024-01-30 15:30",
    duration: "30 min",
    type: "Follow-up Consultation",
    status: "Pending Confirmation",
    meetingLink: "https://meet.example.com/ghi789",
    caseRelated: "Personal Injury Claim",
  },
]

const mockCallHistory = [
  {
    id: 1,
    lawyer: "John Doe",
    lawyerAvatar: "JD",
    date: "2024-01-20 14:00",
    duration: "45 min",
    type: "Initial Consultation",
    status: "Completed",
    recording: true,
    caseRelated: "Property Dispute Case",
  },
  {
    id: 2,
    lawyer: "Sarah Wilson",
    lawyerAvatar: "SW",
    date: "2024-01-18 16:30",
    duration: "30 min",
    type: "Contract Review",
    status: "Completed",
    recording: true,
    caseRelated: "Employment Contract Review",
  },
  {
    id: 3,
    lawyer: "Michael Brown",
    lawyerAvatar: "MB",
    date: "2024-01-15 11:00",
    duration: "60 min",
    type: "Case Discussion",
    status: "Missed",
    recording: false,
    caseRelated: "Personal Injury Claim",
  },
  {
    id: 4,
    lawyer: "John Doe",
    lawyerAvatar: "JD",
    date: "2024-01-12 09:30",
    duration: "25 min",
    type: "Quick Update",
    status: "Rescheduled",
    recording: false,
    caseRelated: "Property Dispute Case",
  },
]

export default function ClientVideoCallsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [currentCall, setCurrentCall] = useState<any>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Connected")

  const filteredUpcomingCalls = mockUpcomingCalls.filter(
    (call) =>
      call.lawyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caseRelated.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCallHistory = mockCallHistory.filter(
    (call) =>
      call.lawyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caseRelated.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "status-active"
      case "Pending Confirmation":
        return "status-pending"
      case "Completed":
        return "status-completed"
      case "Missed":
        return "status-high-priority"
      case "Rescheduled":
        return "status-pending"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const joinCall = (call: any) => {
    setCurrentCall(call)
    setIsInCall(true)
    setCallDuration(0)
    setConnectionStatus("Connecting...")

    // Simulate connection
    setTimeout(() => {
      setConnectionStatus("Connected")
      // Start duration timer
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      return () => clearInterval(timer)
    }, 2000)
  }

  const endCall = () => {
    setIsInCall(false)
    setCurrentCall(null)
    setCallDuration(0)
    setIsMuted(false)
    setIsVideoOn(true)
    setIsScreenSharing(false)
    setIsRecording(false)
    setConnectionStatus("Disconnected")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isInCall && currentCall) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video Call Interface */}
        <div className="flex-1 relative">
          {/* Main video area */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center text-white">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-4xl bg-gray-700 text-white">{currentCall.lawyerAvatar}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-2">{currentCall.lawyer}</h2>
              <p className="text-gray-300 mb-1">{currentCall.specialty}</p>
              <p className="text-gray-400">{currentCall.type}</p>
            </div>
          </div>

          {/* Self video (Picture in Picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 border-white overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gray-600 text-white">JS</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Call info overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3 text-white">
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`h-2 w-2 rounded-full ${connectionStatus === "Connected" ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span className="text-sm">{connectionStatus}</span>
            </div>
            <div className="text-lg font-mono">{formatDuration(callDuration)}</div>
            {isRecording && (
              <div className="flex items-center gap-1 text-red-400 text-sm mt-1">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                Recording
              </div>
            )}
          </div>
        </div>

        {/* Call controls */}
        <div className="bg-black bg-opacity-90 p-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"} text-white`}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${!isVideoOn ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"} text-white`}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              <Video className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${isScreenSharing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"} text-white`}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-600"} text-white`}
              onClick={() => setIsRecording(!isRecording)}
            >
              <div className="h-3 w-3 bg-current rounded-full"></div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white"
              onClick={endCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black">Video Calls</h1>
          <p className="text-gray-600 text-lg">Connect with your legal team through secure video consultations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 gradient-button-outline formal-shadow bg-transparent">
            <Video className="h-4 w-4" />
            Start Instant Call
          </Button>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 gradient-button formal-shadow">
                <Plus className="h-4 w-4" />
                Schedule Call
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 formal-shadow">
              <DialogHeader>
                <DialogTitle className="text-black">Schedule Video Call</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Request a video consultation with your lawyer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lawyer" className="text-right text-black">
                    Lawyer
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3 bg-white border-gray-200">
                      <SelectValue placeholder="Select lawyer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="john">John Doe - Corporate Law</SelectItem>
                      <SelectItem value="sarah">Sarah Wilson - Family Law</SelectItem>
                      <SelectItem value="michael">Michael Brown - Personal Injury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="caseType" className="text-right text-black">
                    Case Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3 bg-white border-gray-200">
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="property">Property Dispute Case</SelectItem>
                      <SelectItem value="contract">Employment Contract Review</SelectItem>
                      <SelectItem value="injury">Personal Injury Claim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meetingType" className="text-right text-black">
                    Meeting Type
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3 bg-white border-gray-200">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="review">Document Review</SelectItem>
                      <SelectItem value="strategy">Strategy Meeting</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="preferredDate" className="text-right text-black">
                    Preferred Date
                  </Label>
                  <Input id="preferredDate" type="date" className="col-span-3 bg-white border-gray-200" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="preferredTime" className="text-right text-black">
                    Preferred Time
                  </Label>
                  <Input id="preferredTime" type="time" className="col-span-3 bg-white border-gray-200" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right text-black">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Brief description of what you'd like to discuss..."
                    className="col-span-3 bg-white border-gray-200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={() => setIsScheduleDialogOpen(false)}
                  className="gradient-button formal-shadow"
                >
                  Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Calls</CardTitle>
            <Video className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{mockUpcomingCalls.length + mockCallHistory.length}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {mockUpcomingCalls.filter((c) => c.status === "Scheduled").length}
            </div>
            <p className="text-xs text-gray-600">Scheduled calls</p>
          </CardContent>
        </Card>
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Completed</CardTitle>
            <Phone className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {mockCallHistory.filter((c) => c.status === "Completed").length}
            </div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">3.5</div>
            <p className="text-xs text-gray-600">Hours this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Upcoming Calls and Call History */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="upcoming"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Upcoming Calls
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-black data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Call History
            </TabsTrigger>
          </TabsList>

          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-500"
            />
          </div>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          <Card className="gradient-card formal-shadow-lg">
            <CardHeader>
              <CardTitle className="text-black">Upcoming Video Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">Lawyer</TableHead>
                    <TableHead className="text-black">Date & Time</TableHead>
                    <TableHead className="text-black">Type</TableHead>
                    <TableHead className="text-black">Case</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-right text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUpcomingCalls.map((call) => (
                    <TableRow key={call.id} className="border-gray-200">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="gradient-button text-white text-xs">
                              {call.lawyerAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-black">{call.lawyer}</p>
                            <p className="text-sm text-gray-600">{call.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-black">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            {new Date(call.scheduledTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {new Date(call.scheduledTime).toLocaleTimeString()} ({call.duration})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-black">{call.type}</TableCell>
                      <TableCell className="text-black">{call.caseRelated}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {call.status === "Scheduled" && (
                            <Button
                              size="sm"
                              onClick={() => joinCall(call)}
                              className="gap-2 gradient-button formal-shadow"
                            >
                              <Video className="h-4 w-4" />
                              Join Call
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gradient-button-outline formal-shadow bg-transparent"
                          >
                            Reschedule
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="gradient-card formal-shadow-lg">
            <CardHeader>
              <CardTitle className="text-black">Call History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-black">Lawyer</TableHead>
                    <TableHead className="text-black">Date & Time</TableHead>
                    <TableHead className="text-black">Duration</TableHead>
                    <TableHead className="text-black">Type</TableHead>
                    <TableHead className="text-black">Case</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-right text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCallHistory.map((call) => (
                    <TableRow key={call.id} className="border-gray-200">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="gradient-button text-white text-xs">
                              {call.lawyerAvatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-black">{call.lawyer}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-black">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          {new Date(call.date).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-black">
                          <Clock className="h-4 w-4 text-gray-600" />
                          {call.duration}
                        </div>
                      </TableCell>
                      <TableCell className="text-black">{call.type}</TableCell>
                      <TableCell className="text-black">{call.caseRelated}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {call.recording && call.status === "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 gradient-button-outline formal-shadow bg-transparent"
                            >
                              <Play className="h-4 w-4" />
                              Recording
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gradient-button-outline formal-shadow bg-transparent"
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
