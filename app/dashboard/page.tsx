"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Video, MessageSquare, Calendar, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function DashboardPage() {
  const { t } = useLanguage()

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black">Dashboard</h1>
          <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your practice.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 gradient-button-outline formal-shadow bg-transparent">
            <Calendar className="h-4 w-4" />
            Schedule Call
          </Button>
          <Button className="gap-2 gradient-button formal-shadow">
            <Users className="h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">2,350</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+180 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Active Cases</CardTitle>
            <Briefcase className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">125</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+15 from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Upcoming Calls</CardTitle>
            <Video className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">5</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <Clock className="h-3 w-3" />
              <span>Next call in 30 mins</span>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">New Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">12</div>
            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>From 4 clients</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-black">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-black rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">New client consultation scheduled</p>
                <p className="text-sm text-gray-600">John Doe - Tomorrow at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-black rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">Case documents uploaded</p>
                <p className="text-sm text-gray-600">Smith vs. Johnson - 3 files</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 formal-shadow">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium text-black">Payment received</p>
                <p className="text-sm text-gray-600">Invoice #1234 - $2,500</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start gap-3 h-12 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Users className="h-5 w-5" />
              Add New Client
            </Button>
            <Button
              className="w-full justify-start gap-3 h-12 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Briefcase className="h-5 w-5" />
              Create New Case
            </Button>
            <Button
              className="w-full justify-start gap-3 h-12 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Video className="h-5 w-5" />
              Start Video Call
            </Button>
            <Button
              className="w-full justify-start gap-3 h-12 gradient-button-outline formal-shadow bg-transparent"
              variant="outline"
            >
              <Calendar className="h-5 w-5" />
              Schedule Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
