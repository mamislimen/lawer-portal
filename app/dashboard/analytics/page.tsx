"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PolarAngleAxisProps,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  DollarSign,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useAnalytics } from "@/hooks/useAnalytics"

// Transform analytics data for the UI
const transformAnalyticsData = (data: any) => {
  if (!data) return null;
  
  // Transform case progress data for the area chart
  const caseSuccessData = data.caseProgressData.map((item: any) => ({
    month: item.month,
    won: item.progress,
    lost: 100 - item.progress,
    settled: item.progress * 0.8, // Assuming 80% of cases are settled
  }));

  // Transform communication data for the bar chart
  const communicationData = data.communicationData;

  // Transform satisfaction data for the line chart
  const clientSatisfactionData = data.satisfactionHistory.map((item: any) => ({
    month: item.date.split(' ')[0], // Extract month from date
    satisfaction: item.rating,
    responses: 50, // Default value for responses
  }));

  // Transform metrics for the overview cards
  const metrics = {
    successRate: data.metrics.caseProgress,
    satisfaction: data.metrics.satisfaction,
    revenue: data.metrics.totalInvestment,
    responseTime: data.metrics.responseTime,
    totalCases: data.metrics.totalCases,
  };

  // Transform service quality data for the radar chart
  const serviceQualityData = [
    { subject: 'Communication', A: data.serviceQuality.communication, fullMark: 5 },
    { subject: 'Expertise', A: data.serviceQuality.expertise, fullMark: 5 },
    { subject: 'Responsiveness', A: data.serviceQuality.responsiveness, fullMark: 5 },
    { subject: 'Value', A: data.serviceQuality.value, fullMark: 5 },
  ];

  return {
    caseSuccessData,
    communicationData,
    clientSatisfactionData,
    metrics,
    serviceQualityData,
  };
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  format?: (value: number) => string;
}

const MetricCard = ({ title, value, change, icon, format }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">
        {typeof value === 'number' && format ? format(value) : value}
      </div>
      <div className={`flex items-center gap-1 text-xs mt-1 ${
        change >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        {change >= 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(change)}% from last month</span>
      </div>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-[300px]">
      {children}
    </CardContent>
  </Card>
);

export default function AnalyticsPage() {
  const { data: analyticsData, loading, error } = useAnalytics();
  
  // Transform the data for the UI
  const transformedData = useMemo(() => transformAnalyticsData(analyticsData), [analyticsData]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-2xl font-bold">Error loading analytics</h2>
          <p className="text-muted-foreground">
            We couldn't load your analytics data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Use transformed data or fallback to empty data
  const {
    caseSuccessData = [],
    communicationData = [],
    clientSatisfactionData = [],
    metrics = {
      successRate: 0,
      satisfaction: 0,
      revenue: 0,
      responseTime: 0,
      totalCases: 0,
    },
    serviceQualityData = [],
  } = transformedData || {};
  
  // Calculate derived metrics
  const lawyerPerformance = [
    {
      name: "Your Firm",
      casesWon: Math.round((metrics.successRate / 100) * metrics.totalCases) || 0,
      totalCases: metrics.totalCases || 0,
      successRate: metrics.successRate || 0,
      clientSatisfaction: metrics.satisfaction || 0,
      avgCaseValue: metrics.revenue / (metrics.totalCases || 1),
      responseTime: metrics.responseTime ? `${metrics.responseTime}h` : 'N/A',
    },
  ];
  
  const marketTrends = [
    { 
      category: "Your Cases", 
      trend: metrics.totalCases > 0 ? `+${Math.round(metrics.successRate / 10)}%` : 'N/A', 
      growth: "up" 
    },
    { 
      category: "Client Satisfaction", 
      trend: metrics.satisfaction > 0 ? `${metrics.satisfaction.toFixed(1)}/5` : 'N/A', 
      growth: "up" 
    },
    { 
      category: "Response Time", 
      trend: metrics.responseTime ? `${metrics.responseTime}h` : 'N/A', 
      growth: metrics.responseTime < 2 ? "up" : "down" 
    },
  ];

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
            <MetricCard 
              title="Overall Success Rate"
              value={metrics.successRate}
              change={5.2}
              format={(val) => `${val.toFixed(1)}%`}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard 
              title="Client Satisfaction"
              value={metrics.satisfaction}
              change={3.8}
              format={(val) => `${val.toFixed(1)}/5`}
              icon={<Star className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard 
              title="Total Revenue"
              value={metrics.revenue}
              change={12.5}
              format={(val) => `$${(val / 1000).toFixed(1)}K`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard 
              title="Avg. Response Time"
              value={metrics.responseTime || 0}
              change={-2.1}
              format={(val) => `${val.toFixed(1)}h`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Case Progress">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={caseSuccessData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="won" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="settled" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="lost" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Client Communication">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={communicationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill="#8884d8" name="Calls" />
                  <Bar dataKey="emails" fill="#82ca9d" name="Emails" />
                  <Bar dataKey="meetings" fill="#ffc658" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Client Satisfaction">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientSatisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="satisfaction" stroke="#8884d8" name="Satisfaction (1-5)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Service Quality">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={serviceQualityData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
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
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {lawyer.successRate > 80 ? 'Top Performer' : 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm text-muted-foreground">{lawyer.successRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={lawyer.successRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {lawyer.casesWon} of {lawyer.totalCases} cases
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Client Satisfaction</span>
                        <span className="text-sm text-muted-foreground">
                          {lawyer.clientSatisfaction.toFixed(1)}/5
                        </span>
                      </div>
                      <Progress value={lawyer.clientSatisfaction * 20} className="h-2" />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.round(lawyer.clientSatisfaction) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Avg Case Value</span>
                      <div className="text-2xl font-bold">
                        ${(lawyer.avgCaseValue / 1000).toFixed(1)}K
                      </div>
                      <p className="text-xs text-muted-foreground">Per case average</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Avg Response Time</span>
                      <div className="text-2xl font-bold">{lawyer.responseTime}</div>
                      <p className="text-xs text-muted-foreground">To client inquiries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {marketTrends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{trend.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{trend.trend}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {trend.growth === "up" ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Positive trend</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Needs attention</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
