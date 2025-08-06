"use client"

import { useState } from "react"
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
import { Plus, Video, Calendar, Clock, Phone, PhoneOff, Search } from "lucide-react"

const mockCalls = [
  {
    id: 1,
    client: "John Smith",
    scheduledTime: "2024-01-25 14:00",
    duration: "45 min",
    status: "Scheduled",
    type: "Consultation",
    meetingLink: "https://meet.example.com/abc123",
  },
  {
    id: 2,
    client: "Sarah Johnson",
    scheduledTime: "2024-01-25 16:30",
    duration: "30 min",
    status: "Completed",
    type: "Follow-up",
    meetingLink: "https://meet.example.com/def456",
  },
  {
    id: 3,
    client: "Michael Brown",
    scheduledTime: "2024-01-26 10:00",
    duration: "60 min",
    status: "Scheduled",
    type: "Case Review",
    meetingLink: "https://meet.example.com/ghi789",
  },
]

export default function VideoCallsPage() {
  const [calls, setCalls] = useState(mockCalls)
  const [searchTerm, setSearchTerm] = useState("")
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)

  const filteredCalls = calls.filter(
    (call) =>
      call.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "In Progress":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const startCall = (meetingLink: string) => {
    window.open(meetingLink, "_blank")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Video Calls</h1>
          <p className="text-muted-foreground text-lg">Schedule and manage video consultations with your clients.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
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
            <div className="text-3xl font-bold">{calls.filter((c) => c.status === "Scheduled").length}</div>
            <p className="text-xs text-muted-foreground">Upcoming calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calls.filter((c) => c.status === "Completed").length}</div>
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
                  <TableCell className="font-medium">{call.client}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(call.scheduledTime).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {call.duration}
                    </div>
                  </TableCell>
                  <TableCell>{call.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {call.status === "Scheduled" && (
                        <Button size="sm" onClick={() => startCall(call.meetingLink)} className="gap-2">
                          <Video className="h-4 w-4" />
                          Join Call
                        </Button>
                      )}
                      {call.status === "In Progress" && (
                        <Button size="sm" variant="destructive" className="gap-2">
                          <PhoneOff className="h-4 w-4" />
                          End Call
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
