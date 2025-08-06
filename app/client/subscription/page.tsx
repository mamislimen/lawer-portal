"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Check, Crown, Star, Zap, Shield, Phone, Clock, Users } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ClientSubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("premium")
  const { t } = useLanguage()

  const plans = [
    {
      id: "basic",
      name: t("subscription.basicClient"),
      price: t("subscription.free"),
      description: t("subscription.essentialServices"),
      features: [
        t("subscription.caseStatusUpdates"),
        t("subscription.documentAccess"),
        t("subscription.emailCommunication"),
        t("nav.appointments") + " " + t("subscription.priorityScheduling").toLowerCase(),
        "Mobile app access",
      ],
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      id: "premium",
      name: t("subscription.premiumClient"),
      price: "$29",
      period: t("subscription.perMonth"),
      description: t("subscription.enhancedServices"),
      features: [
        t("subscription.everythingInBasic"),
        "2 " + t("time.hours") + " " + t("subscription.videoConsultations") + t("subscription.perMonth"),
        t("subscription.documentUpload"),
        t("subscription.priorityScheduling"),
        t("subscription.advancedInsights"),
        t("subscription.prioritySupport"),
      ],
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      popular: true,
    },
    {
      id: "vip",
      name: t("subscription.vipClient"),
      price: "$99",
      period: t("subscription.perMonth"),
      description: t("subscription.premiumServices"),
      features: [
        t("subscription.everythingInPremium"),
        t("subscription.unlimitedVideo"),
        t("subscription.legalHotline"),
        t("subscription.dedicatedManager"),
        "Expedited services",
        "Concierge legal services",
      ],
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const addOns = [
    {
      name: t("subscription.emergencySupport"),
      price: "$19" + t("subscription.perMonth"),
      description: t("subscription.emergencyDescription"),
      icon: Phone,
    },
    {
      name: t("subscription.documentReviewService"),
      price: "$39" + t("subscription.perMonth"),
      description: t("subscription.documentReviewDescription"),
      icon: Shield,
    },
    {
      name: t("subscription.extendedVideoTime"),
      price: "$15" + t("subscription.perMonth"),
      description: t("subscription.extendedVideoDescription"),
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{t("subscription.title")}</h1>
        <p className="text-muted-foreground text-lg">{t("subscription.subtitle")}</p>
      </div>

      {/* Current Plan Status */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{t("subscription.premiumClient")} Plan</CardTitle>
                <p className="text-sm text-muted-foreground">{t("subscription.currentPlan")}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t("subscription.active")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("subscription.videoHoursUsed")}</span>
                <span className="text-sm text-muted-foreground">1.5h / 2h</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("subscription.prioritySupport")}</span>
                <span className="text-sm text-green-600">Available</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("subscription.nextBilling")}</span>
                <span className="text-sm text-muted-foreground">Feb 15, 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = currentPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative border-2 transition-all duration-200 hover:shadow-lg ${
                plan.popular ? "border-blue-200 shadow-md" : "border-border"
              } ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">{t("subscription.mostPopular")}</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={`mx-auto h-16 w-16 rounded-full ${plan.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-8 w-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  {plan.price}
                  {plan.period && <span className="text-lg font-normal text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Separator />

                <Button className="w-full" variant={isCurrentPlan ? "outline" : "default"} disabled={isCurrentPlan}>
                  {isCurrentPlan ? t("subscription.currentPlanBadge") : `${t("subscription.upgrade")} ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add-on Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t("subscription.additionalServices")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("subscription.enhanceSubscription")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {addOns.map((addon, index) => {
              const Icon = addon.icon
              return (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{addon.name}</h3>
                      <span className="text-sm font-semibold">{addon.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{addon.description}</p>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      {t("subscription.addService")}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t("subscription.billingHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{t("subscription.premiumClient")} Plan</p>
                <p className="text-sm text-muted-foreground">January 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$29.00</p>
                <Badge className="bg-green-100 text-green-800 border-green-200">{t("common.paid")}</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{t("subscription.premiumClient")} Plan</p>
                <p className="text-sm text-muted-foreground">December 2023</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$29.00</p>
                <Badge className="bg-green-100 text-green-800 border-green-200">{t("common.paid")}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
