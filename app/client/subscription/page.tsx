"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Check, Crown, Star, Zap, Shield, Phone, Clock, Users } from "lucide-react"

export default function ClientSubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("premium")

  const plans = [
    {
      id: "basic",
      name: "Basic Client",
      price: "Free",
      description: "Essential legal services",
      features: [
        "Case status updates",
        "Document access",
        "Email communication",
        "Basic appointment scheduling",
        "Mobile app access"
      ],
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      id: "premium",
      name: "Premium Client",
      price: "$29",
      period: "per month",
      description: "Enhanced legal services",
      features: [
        "Everything in Basic",
        "2 hours video consultations per month",
        "Document upload and storage",
        "Priority scheduling",
        "Advanced case insights",
        "Priority support"
      ],
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "Dedicated legal services",
      features: [
        "Everything in Premium",
        "Unlimited video consultations",
        "Dedicated case manager",
        "24/7 emergency support",
        "Custom integrations",
        "Team access"
      ],
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    }
  ]

  const features = [
    {
      name: "Document Storage",
      basic: "5GB",
      premium: "50GB",
      enterprise: "Unlimited"
    },
    {
      name: "Video Consultations",
      basic: "Not included",
      premium: "2 hours/month",
      enterprise: "Unlimited"
    },
    {
      name: "Response Time",
      basic: "48 hours",
      premium: "12 hours",
      enterprise: "2 hours"
    },
    {
      name: "Priority Support",
      basic: false,
      premium: true,
      enterprise: true
    },
    {
      name: "Dedicated Manager",
      basic: false,
      premium: false,
      enterprise: true
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your legal needs. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </Badge>
              </div>
            )}
            <Card className={`h-full flex flex-col ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
              <CardHeader className={`${plan.bgColor} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <plan.icon className={`h-6 w-6 ${plan.color}`} />
                    <CardTitle className={`text-lg ${plan.color}`}>
                      {plan.name}
                    </CardTitle>
                  </div>
                  {plan.id === currentPlan && (
                    <Badge className="bg-green-100 text-green-800">Current Plan</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    {plan.price}{plan.period && <span className="text-sm font-normal text-gray-500">/{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  <Button 
                    className={`w-full ${plan.id === currentPlan ? 'bg-gray-300 hover:bg-gray-400' : ''}`}
                    disabled={plan.id === currentPlan}
                  >
                    {plan.id === currentPlan ? 'Current Plan' : 'Get Started'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-12">
        <h2 className="text-xl font-semibold mb-6">Plan Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 w-1/3">Features</th>
                <th className="text-center py-3 px-4 w-1/4">Basic</th>
                <th className="text-center py-3 px-4 w-1/4">Premium</th>
                <th className="text-center py-3 px-4 w-1/4">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-3 px-4">{feature.name}</td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.basic === 'boolean' ? 
                      (feature.basic ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—') : 
                      feature.basic}
                  </td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.premium === 'boolean' ? 
                      (feature.premium ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—') : 
                      feature.premium}
                  </td>
                  <td className="text-center py-3 px-4">
                    {typeof feature.enterprise === 'boolean' ? 
                      (feature.enterprise ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—') : 
                      feature.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-8 text-center">
        <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Need help choosing a plan?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Our team is here to help you find the perfect plan for your legal needs.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Phone className="mr-2 h-4 w-4" /> Contact Sales
        </Button>
      </div>
    </div>
  )
}
