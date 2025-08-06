"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import {
  Crown,
  CreditCard,
  Users,
  FileText,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"

const currentPlan = {
  name: "Premium",
  price: 149,
  billingCycle: "monthly",
  nextBilling: "2024-02-15",
  status: "active",
  features: ["Up to 50 clients", "50GB storage", "AI-powered insights", "Priority support", "Advanced analytics"],
}

const usageStats = {
  clients: { current: 32, limit: 50, percentage: 64 },
  storage: { current: 28.5, limit: 50, percentage: 57 },
  apiCalls: { current: 8420, limit: 10000, percentage: 84 },
  videoMinutes: { current: 145, limit: 500, percentage: 29 },
}

const billingHistory = [
  {
    id: "INV-2024-001",
    date: "2024-01-15",
    amount: 149,
    status: "paid",
    description: "Premium Plan - Monthly",
  },
  {
    id: "INV-2023-012",
    date: "2023-12-15",
    amount: 149,
    status: "paid",
    description: "Premium Plan - Monthly",
  },
  {
    id: "INV-2023-011",
    date: "2023-11-15",
    amount: 149,
    status: "paid",
    description: "Premium Plan - Monthly",
  },
]

const availableAddons = [
  {
    name: "AI Legal Assistant",
    description: "Advanced AI for document analysis",
    price: 29,
    active: false,
  },
  {
    name: "Advanced Security",
    description: "Enhanced encryption and compliance",
    price: 19,
    active: true,
  },
  {
    name: "White-label Branding",
    description: "Custom branding for your firm",
    price: 49,
    active: false,
  },
]

export default function SubscriptionPage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "past_due":
        return "bg-red-100 text-red-800 border-red-200"
      case "canceled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground text-lg">Manage your plan, usage, and billing information.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <CreditCard className="h-4 w-4" />
            Update Payment
          </Button>
          <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Crown className="h-4 w-4" />
                Upgrade Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upgrade Your Plan</DialogTitle>
                <DialogDescription>Choose a plan that better fits your growing needs.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Enterprise Plan</span>
                      <Badge className="bg-gold-100 text-gold-800 border-gold-200">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unlimited clients, storage, and advanced features
                    </p>
                    <div className="text-2xl font-bold">$399/month</div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="billing" className="text-right">
                      Billing
                    </Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly (Save 17%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setIsUpgradeDialogOpen(false)}>
                  Upgrade Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  Current Plan: {currentPlan.name}
                </CardTitle>
                <Badge className={getStatusColor(currentPlan.status)}>
                  {currentPlan.status === "active" ? "Active" : currentPlan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Cost</span>
                    <span className="text-2xl font-bold">${currentPlan.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Billing</span>
                    <span className="text-sm text-muted-foreground">{currentPlan.nextBilling}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Billing Cycle</span>
                    <span className="text-sm text-muted-foreground capitalize">{currentPlan.billingCycle}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Plan Features</h3>
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.clients.current}</div>
                <p className="text-xs text-muted-foreground">of {usageStats.clients.limit} limit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.storage.current}GB</div>
                <p className="text-xs text-muted-foreground">of {usageStats.storage.limit}GB limit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.apiCalls.current.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">of {usageStats.apiCalls.limit.toLocaleString()} limit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Video Minutes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.videoMinutes.current}</div>
                <p className="text-xs text-muted-foreground">of {usageStats.videoMinutes.limit} limit</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(usageStats).map(([key, stats]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {key === "apiCalls" ? "API Calls" : key === "videoMinutes" ? "Video Minutes" : key}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {typeof stats.current === "number" && stats.current % 1 !== 0
                        ? stats.current.toFixed(1)
                        : stats.current.toLocaleString()}{" "}
                      / {stats.limit.toLocaleString()}
                      {key === "storage" ? "GB" : key === "videoMinutes" ? " min" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={stats.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-12">{stats.percentage}%</span>
                  </div>
                  {stats.percentage >= 90 && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Approaching limit - consider upgrading</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Usage Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">API Usage High</p>
                  <p className="text-xs text-yellow-700">
                    You're using 84% of your API calls. Consider upgrading to Enterprise for unlimited API access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Growth Opportunity</p>
                  <p className="text-xs text-blue-700">
                    Your client base is growing steadily. The Enterprise plan offers unlimited clients and better
                    scaling.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" className="bg-transparent">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.id} • {new Date(invoice.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${invoice.amount}</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableAddons.map((addon, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{addon.name}</p>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">${addon.price}/month</p>
                      </div>
                      {addon.active ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      ) : (
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle>Need Something Custom?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Looking for specific integrations or custom features? Our team can help build exactly what you need.
                </p>
                <Button className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
