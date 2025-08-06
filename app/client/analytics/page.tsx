"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Clock, Star, Target, Calendar, DollarSign, FileText, MessageSquare } from "lucide-react"

// Mock data for client analytics
const caseProgressData = [
  { month: "Jan", progress: 15 },
  { month: "Feb", progress: 28 },
  { month: "Mar", progress: 45 },
  { month: "Apr", progress: 62 },
  { month: "May", progress: 78 },
  { month: "Jun", progress: 85 },
]

const communicationData = [
  { month: "Jan", messages: 12, calls: 3 },
  { month: "Feb", messages: 18, calls: 4 },
  { month: "Mar", messages: 15, calls: 2 },
  { month: "Apr", messages: 22, calls: 5 },
  { month: "May", messages: 19, calls: 3 },
  { month: "Jun", messages: 25, calls: 4 },
]

const satisfactionHistory = [
  { date: "Jan 2024", rating: 4.2 },
  { date: "Feb 2024", rating: 4.5 },
  { date: "Mar 2024", rating: 4.3 },
  { date: "Apr 2024", rating: 4.7 },
  { date: "May 2024", rating: 4.8 },
  { date: "Jun 2024", rating: 4.9 },
]

export default function ClientAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">My Legal Journey</h1>
        <p className="text-muted-foreground text-lg">Track your case progress and legal service experience.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <Progress value={85} className="mt-2 h-2" />
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+7% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.9/5</div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+0.1 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.8h</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>25% faster than average</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$8,750</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>Across 3 cases</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={caseProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#8884d8" />
                <Bar dataKey="calls" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Quality Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Satisfaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={satisfactionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[3.5, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Quality Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Communication Quality</span>
                <span className="text-sm text-muted-foreground">4.9/5</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Legal Expertise</span>
                <span className="text-sm text-muted-foreground">4.8/5</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Responsiveness</span>
                <span className="text-sm text-muted-foreground">5.0/5</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Value for Money</span>
                <span className="text-sm text-muted-foreground">4.7/5</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="font-semibold text-green-700">What's Going Well</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Excellent Communication</p>
                    <p className="text-xs text-green-700">Your lawyer responds 25% faster than average</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Strong Case Progress</p>
                    <p className="text-xs text-green-700">Your cases are progressing 15% faster than typical</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-blue-700">Opportunities</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Document Organization</p>
                    <p className="text-xs text-blue-700">Consider uploading remaining medical records</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Schedule Check-in</p>
                    <p className="text-xs text-blue-700">Monthly progress meetings could help track milestones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison with Other Clients */}
      <Card>
        <CardHeader>
          <CardTitle>How You Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-600">Top 10%</div>
              <p className="text-sm text-muted-foreground">Client Engagement</p>
              <Badge className="bg-green-100 text-green-800 border-green-200">Highly Engaged</Badge>
            </div>

            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">Above Average</div>
              <p className="text-sm text-muted-foreground">Case Preparation</p>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">Well Prepared</Badge>
            </div>

            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-600">Excellent</div>
              <p className="text-sm text-muted-foreground">Communication</p>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">Responsive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
