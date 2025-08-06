"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Star,
  Target,
  Award,
  Clock,
  ThumbsUp,
} from "lucide-react"

// Mock data for analytics
const caseSuccessData = [
  { month: "Jan", won: 85, lost: 15, settled: 45 },
  { month: "Feb", won: 78, lost: 22, settled: 38 },
  { month: "Mar", won: 92, lost: 8, settled: 52 },
  { month: "Apr", won: 88, lost: 12, settled: 41 },
  { month: "May", won: 95, lost: 5, settled: 48 },
  { month: "Jun", won: 89, lost: 11, settled: 44 },
]

const revenueData = [
  { month: "Jan", revenue: 125000, cases: 45 },
  { month: "Feb", revenue: 138000, cases: 52 },
  { month: "Mar", revenue: 142000, cases: 48 },
  { month: "Apr", revenue: 156000, cases: 55 },
  { month: "May", revenue: 168000, cases: 61 },
  { month: "Jun", revenue: 175000, cases: 58 },
]

const caseTypeData = [
  { name: "Personal Injury", value: 35, color: "#0088FE" },
  { name: "Corporate Law", value: 28, color: "#00C49F" },
  { name: "Real Estate", value: 20, color: "#FFBB28" },
  { name: "Family Law", value: 17, color: "#FF8042" },
]

const clientSatisfactionData = [
  { month: "Jan", satisfaction: 4.2, responses: 45 },
  { month: "Feb", satisfaction: 4.3, responses: 52 },
  { month: "Mar", satisfaction: 4.5, responses: 48 },
  { month: "Apr", satisfaction: 4.4, responses: 55 },
  { month: "May", satisfaction: 4.6, responses: 61 },
  { month: "Jun", satisfaction: 4.7, responses: 58 },
]

const lawyerPerformance = [
  {
    name: "John Doe",
    casesWon: 45,
    totalCases: 52,
    successRate: 86.5,
    clientSatisfaction: 4.8,
    avgCaseValue: 125000,
    responseTime: "2.3h",
  },
  {
    name: "Sarah Wilson",
    casesWon: 38,
    totalCases: 42,
    successRate: 90.5,
    clientSatisfaction: 4.6,
    avgCaseValue: 98000,
    responseTime: "1.8h",
  },
  {
    name: "Michael Chen",
    casesWon: 32,
    totalCases: 38,
    successRate: 84.2,
    clientSatisfaction: 4.5,
    avgCaseValue: 110000,
    responseTime: "3.1h",
  },
]

const marketTrends = [
  { category: "Personal Injury", trend: "+12%", growth: "up" },
  { category: "Corporate Law", trend: "+8%", growth: "up" },
  { category: "Real Estate", trend: "-3%", growth: "down" },
  { category: "Family Law", trend: "+15%", growth: "up" },
  { category: "Criminal Defense", trend: "+5%", growth: "up" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground text-lg">Comprehensive performance analytics for your law firm.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lawyers">Lawyer Performance</TabsTrigger>
          <TabsTrigger value="clients">Client Insights</TabsTrigger>
          <TabsTrigger value="market">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">89.2%</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5.2% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.7/5</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+0.3 from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$175K</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4h</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>-0.5h improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Case Success Rate Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={caseSuccessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="won" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                    <Area
                      type="monotone"
                      dataKey="settled"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="lost"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue & Case Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="right" dataKey="cases" fill="#8884d8" />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Case Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={caseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {caseTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Satisfaction Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={clientSatisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="satisfaction" stroke="#8884d8" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lawyers" className="space-y-6">
          <div className="grid gap-6">
            {lawyerPerformance.map((lawyer, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {lawyer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      {lawyer.name}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Top Performer</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-muted-foreground">{lawyer.successRate}%</span>
                      </div>
                      <Progress value={lawyer.successRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lawyer.casesWon}/{lawyer.totalCases} cases won
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Client Satisfaction</span>
                        <span className="text-sm text-muted-foreground">{lawyer.clientSatisfaction}/5</span>
                      </div>
                      <Progress value={lawyer.clientSatisfaction * 20} className="h-2" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < Math.floor(lawyer.clientSatisfaction) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Avg Case Value</span>
                      <div className="text-2xl font-bold">${(lawyer.avgCaseValue / 1000).toFixed(0)}K</div>
                      <p className="text-xs text-muted-foreground">Per case average</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <div className="text-2xl font-bold">{lawyer.responseTime}</div>
                      <p className="text-xs text-muted-foreground">Average response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">94.2%</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+2.1% from last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">68%</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8% from last quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Case Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.2mo</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>-0.8mo improvement</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Lifetime Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$45K</div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+15% from last year</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Feedback Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Client Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      "Excellent communication throughout the entire process. John kept me informed every step of the
                      way."
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">- Sarah M. • Property Dispute Case</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      "Professional service and great results. Could improve response time for urgent matters."
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">- Michael R. • Personal Injury Case</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      "Outstanding legal expertise and client care. Highly recommend to anyone needing legal services."
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">- Jennifer L. • Corporate Law Case</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Legal Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{trend.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${trend.growth === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {trend.trend}
                      </span>
                      {trend.growth === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate vs Market Avg</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">+12% Above</Badge>
                  </div>
                  <Progress value={89} className="h-2" />
                  <p className="text-xs text-muted-foreground">Your firm: 89% | Market average: 77%</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Client Satisfaction vs Market</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">+0.5 Above</Badge>
                  </div>
                  <Progress value={94} className="h-2" />
                  <p className="text-xs text-muted-foreground">Your firm: 4.7/5 | Market average: 4.2/5</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Time vs Market</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">35% Faster</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">Your firm: 2.4h | Market average: 3.7h</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Expand Personal Injury Practice</p>
                      <p className="text-xs text-blue-700">Market showing +15% growth. Consider hiring specialist.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Improve Response Time</p>
                      <p className="text-xs text-yellow-700">Some lawyers averaging 3h+. Target: under 2h for all.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Leverage High Satisfaction</p>
                      <p className="text-xs text-green-700">4.7/5 rating. Implement referral program to capitalize.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
