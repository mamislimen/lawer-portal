"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, MessageSquare, Calendar, FileText, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/rbac"
import { useClientCases, type ClientCase, type Activity } from "@/hooks/useClientCases"
import { formatDistanceToNow } from "date-fns"

interface DashboardData {
  user: {
    id: string
    name: string | null
    email: string | null
    role: UserRole
  }
  stats: {
    activeCases: number
    unreadMessages: number
    upcomingMeetings: number
    pendingDocuments: number
  }
  recentActivity: Array<{
    id: string
    type: string
    title: string
    date: string
    status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS'
  }>
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    user: {
      id: '',
      name: null,
      email: null,
      role: 'CLIENT' as UserRole,
    },
    stats: {
      activeCases: 0,
      unreadMessages: 0,
      upcomingMeetings: 0,
      pendingDocuments: 0,
    },
    recentActivity: [],
  })
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch cases and activities
  const { data: casesData, isLoading: isLoadingCases } = useClientCases()
  
  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'IN_REVIEW':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Review</Badge>
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  // Format activity icon
  const getActivityIcon = (type: string) => {
    const baseClasses = "h-2 w-2 rounded-full"
    switch (type) {
      case 'DOCUMENT_UPLOAD':
        return <FileText className={`${baseClasses} text-blue-500`} />
      case 'MESSAGE':
        return <MessageSquare className={`${baseClasses} text-green-500`} />
      case 'APPOINTMENT':
        return <Calendar className={`${baseClasses} text-purple-500`} />
      case 'CASE_UPDATE':
        return <AlertCircle className={`${baseClasses} text-orange-500`} />
      default:
        return <div className={`${baseClasses} bg-gray-400`} />
    }
  }

  useEffect(() => {
    // Temporarily bypass data fetching
    setIsLoading(false)
    setError(null)
    
    // Set mock data to show the UI
    setDashboardData({
      user: {
        id: 'temp-id',
        name: session?.user?.name || 'Guest User',
        email: session?.user?.email || 'guest@example.com',
        role: 'CLIENT' as UserRole
      },
      stats: {
        activeCases: 0,
        unreadMessages: 0,
        upcomingMeetings: 0,
        pendingDocuments: 0
      },
      recentActivity: []
    })
  }, [status, session])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    // Redirect to sign-in page handled by middleware
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p>Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Welcome back, {dashboardData?.user?.name || 'User'}
          </h1>
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
            <div className="text-3xl font-bold text-black">
              {dashboardData.stats.activeCases}
            </div>
            {dashboardData.stats.activeCases > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>Requires attention</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Unread Messages</CardTitle>
            <MessageSquare className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {dashboardData.stats.unreadMessages}
            </div>
            {dashboardData.stats.unreadMessages > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <Clock className="h-3 w-3" />
                <span>New messages</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Upcoming Meetings</CardTitle>
            <Calendar className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {dashboardData.stats.upcomingMeetings}
            </div>
            {dashboardData.stats.upcomingMeetings > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <Clock className="h-3 w-3" />
                <span>Upcoming soon</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-card formal-shadow-lg hover:formal-shadow transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Pending Documents</CardTitle>
            <FileText className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">
              {dashboardData.stats.pendingDocuments}
            </div>
            {dashboardData.stats.pendingDocuments > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <AlertCircle className="h-3 w-3 text-yellow-500" />
                <span>Review required</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Cases */}
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl text-black">My Cases</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/client/cases')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingCases ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : casesData?.cases && casesData.cases.length > 0 ? (
              casesData.cases.slice(0, 3).map((c: ClientCase) => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer formal-shadow"
                  onClick={() => router.push(`/client/cases/${c.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black">{c.title}</h3>
                      {c.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{c.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(c.status)}
                        {c.nextHearingDate && (
                          <span className="text-xs text-gray-600">
                            Next: {new Date(c.nextHearingDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active cases found</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/client/cases')}
                >
                  Create New Case
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="gradient-card formal-shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-black">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingCases ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : casesData?.activities && casesData.activities.length > 0 ? (
              casesData.activities.slice(0, 5).map((activity: Activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer formal-shadow"
                  onClick={() => {
                    if (activity.caseId) {
                      router.push(`/client/cases/${activity.caseId}`)
                    }
                  }}
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-black">{activity.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
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
