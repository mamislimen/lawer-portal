"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MessageSquare, Calendar, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ClientDashboard() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black">Welcome back, John</h1>
          <p className="text-gray-600 text-lg">Here's an overview of your legal matters.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 gradient-button-outline formal-shadow bg-transparent">
            <MessageSquare className="h-4 w-4" />
            Contact Lawyer
          </Button>
          <Button className="gap-2 gradient-button formal-shadow">
            <Calendar className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Active Cases</CardTitle>
            <Briefcase className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">3</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>2 require attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Unread Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">5</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <Clock className="h-3 w-3" />
              <span>From your lawyer</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Upcoming Appointments</CardTitle>
            <Calendar className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">2</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <Clock className="h-3 w-3" />
              <span>Next: Tomorrow 2PM</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Documents</CardTitle>
            <FileText className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">12</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <CheckCircle className="h-3 w-3" />
              <span>All signed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Cases */}
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-black">My Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="flex-1">
                <p className="font-medium text-black">Property Dispute Case</p>
                <p className="text-sm text-gray-600">Smith vs. Johnson</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="status-pending">In Progress</Badge>
                  <span className="text-xs text-gray-600">Next hearing: Feb 15</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="flex-1">
                <p className="font-medium text-black">Contract Review</p>
                <p className="text-sm text-gray-600">Employment Agreement</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="status-active">Under Review</Badge>
                  <span className="text-xs text-gray-600">Started: Jan 18</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="flex-1">
                <p className="font-medium text-black">Personal Injury Claim</p>
                <p className="text-sm text-gray-600">Motor Vehicle Accident</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="status-completed">Active</Badge>
                  <span className="text-xs text-gray-600">Settlement pending</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-black">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-black rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">Document uploaded</p>
                <p className="text-sm text-gray-600">Medical records for injury claim</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-black rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">Message from lawyer</p>
                <p className="text-sm text-gray-600">Update on property dispute case</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">Appointment scheduled</p>
                <p className="text-sm text-gray-600">Consultation meeting tomorrow</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="gradient-card formal-shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-black">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              className="h-20 flex-col gap-2 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Send Message</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <FileText className="h-6 w-6" />
              <span>Upload Document</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Meeting</span>
            </Button>
            <Button
              className="h-20 flex-col gap-2 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Briefcase className="h-6 w-6" />
              <span>View All Cases</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
