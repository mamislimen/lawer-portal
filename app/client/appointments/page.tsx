"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Clock, Video, MapPin, Phone } from "lucide-react"

const mockAppointments = [
  {
    id: 1,
    title: "Case Strategy Meeting",
    lawyer: "John Doe",
    date: "2024-01-26",
    time: "14:00",
    duration: "60 min",
    type: "In-Person",
    status: "Confirmed",
    location: "Law Office - Conference Room A",
    description: "Discuss strategy for property dispute case and review evidence",
  },
  {
    id: 2,
    title: "Document Review Session",
    lawyer: "John Doe",
    date: "2024-01-28",
    time: "10:00",
    duration: "45 min",
    type: "Video Call",
    status: "Confirmed",
    location: "Video Conference",
    description: "Review and sign settlement documents",
  },
  {
    id: 3,
    title: "Follow-up Consultation",
    lawyer: "Sarah Wilson",
    date: "2024-02-02",
    time: "15:30",
    duration: "30 min",
    type: "Phone Call",
    status: "Pending",
    location: "Phone Conference",
    description: "Follow up on contract review progress",
  },
]

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video Call":
        return <Video className="h-4 w-4" />
      case "Phone Call":
        return <Phone className="h-4 w-4" />
      case "In-Person":
        return <MapPin className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground text-lg">Manage your meetings with your legal team.</p>
        </div>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Request Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Appointment</DialogTitle>
              <DialogDescription>Request a meeting with your lawyer or legal team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointmentType" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="document-review">Document Review</SelectItem>
                    <SelectItem value="case-update">Case Update</SelectItem>
                    <SelectItem value="strategy-meeting">Strategy Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preferredDate" className="text-right">
                  Preferred Date
                </Label>
                <Input id="preferredDate" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="preferredTime" className="text-right">
                  Preferred Time
                </Label>
                <Input id="preferredTime" type="time" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meetingType" className="text-right">
                  Meeting Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select meeting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Brief description of what you'd like to discuss..."
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsRequestDialogOpen(false)}>
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.filter((a) => a.status === "Confirmed").length}</div>
            <p className="text-xs text-muted-foreground">Confirmed meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.filter((a) => a.status === "Pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Meeting</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Tomorrow</div>
            <p className="text-xs text-muted-foreground">2:00 PM</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting</TableHead>
                <TableHead>Lawyer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.title}</p>
                      <p className="text-sm text-muted-foreground">{appointment.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.lawyer}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {appointment.time} ({appointment.duration})
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(appointment.type)}
                      {appointment.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </TableCell>
                  <TableCell>{appointment.location}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {appointment.status === "Confirmed" && appointment.type === "Video Call" && (
                        <Button size="sm" className="gap-2">
                          <Video className="h-4 w-4" />
                          Join
                        </Button>
                      )}
                      {appointment.status === "Pending" && (
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Reschedule
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
