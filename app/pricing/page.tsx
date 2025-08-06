"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, X, Star, Zap, Crown, FileText, Shield, Headphones, Video, MessageSquare } from "lucide-react"

const clientTiers = [
  {
    name: "Basic Client",
    description: "Essential legal services and communication",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: FileText,
    color: "bg-blue-500",
    popular: false,
    features: [
      { name: "Case status updates", included: true },
      { name: "Document access (view only)", included: true },
      { name: "Email communication", included: true },
      { name: "Basic appointment scheduling", included: true },
      { name: "Mobile app access", included: true },
      { name: "Standard support", included: true },
      { name: "Video consultations", included: false },
      { name: "Document upload & sharing", included: false },
      { name: "Priority support", included: false },
      { name: "Advanced case insights", included: false },
      { name: "Expedited services", included: false },
      { name: "24/7 legal hotline", included: false },
    ],
  },
  {
    name: "Premium Client",
    description: "Enhanced services with priority access",
    monthlyPrice: 29,
    yearlyPrice: 290,
    icon: Zap,
    color: "bg-purple-500",
    popular: true,
    features: [
      { name: "Everything in Basic", included: true },
      { name: "Video consultations (2 hours/month)", included: true },
      { name: "Document upload & sharing", included: true },
      { name: "Priority appointment scheduling", included: true },
      { name: "Advanced case insights", included: true },
      { name: "Priority support", included: true },
      { name: "Secure messaging", included: true },
      { name: "Document e-signing", included: true },
      { name: "Case progress tracking", included: true },
      { name: "Expedited services", included: false },
      { name: "24/7 legal hotline", included: false },
      { name: "Dedicated case manager", included: false },
    ],
  },
  {
    name: "VIP Client",
    description: "Concierge-level legal services",
    monthlyPrice: 99,
    yearlyPrice: 990,
    icon: Crown,
    color: "bg-gold-500",
    popular: false,
    features: [
      { name: "Everything in Premium", included: true },
      { name: "Unlimited video consultations", included: true },
      { name: "24/7 legal hotline", included: true },
      { name: "Dedicated case manager", included: true },
      { name: "Expedited services", included: true },
      { name: "Priority case handling", included: true },
      { name: "Concierge legal services", included: true },
      { name: "Emergency legal support", included: true },
      { name: "Quarterly legal health check", included: true },
      { name: "Custom legal documents", included: true },
      { name: "White-glove service", included: true },
    ],
  },
]

const additionalServices = [
  {
    name: "Emergency Legal Support",
    description: "24/7 access to legal advice for urgent matters",
    price: 19,
    icon: Shield,
  },
  {
    name: "Document Review Service",
    description: "Professional review of contracts and legal documents",
    price: 39,
    icon: FileText,
  },
  {
    name: "Extended Video Time",
    description: "Additional video consultation hours",
    price: 15,
    icon: Video,
  },
  {
    name: "Legal Research Service",
    description: "Comprehensive legal research for your case",
    price: 49,
    icon: MessageSquare,
  },
]

export default function ClientPricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Choose Your <span className="text-primary">Legal Service</span> Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get the legal support you need with our flexible client service plans. From basic case updates to VIP
            concierge services, we have the right level of support for you.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-primary" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? "text-primary" : "text-muted-foreground"}`}>Yearly</span>
            <Badge className="bg-green-100 text-green-800 border-green-200 ml-2">Save 17%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 mb-16">
          {clientTiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                tier.popular ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <tier.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <p className="text-muted-foreground">{tier.description}</p>

                <div className="mt-6">
                  {tier.monthlyPrice === 0 ? (
                    <div className="text-4xl font-bold">Free</div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">
                          ${isYearly ? Math.floor(tier.yearlyPrice / 12) : tier.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-muted-foreground mt-1">Billed annually (${tier.yearlyPrice}/year)</p>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  className={`w-full ${tier.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.monthlyPrice === 0 ? "Get Started Free" : "Choose Plan"}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Additional Legal Services</h2>
            <p className="text-muted-foreground text-lg">
              Enhance any plan with specialized legal services tailored to your needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {additionalServices.map((service, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-2xl font-bold mb-3">${service.price}/month</div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Add Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Client Plans?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
                <p className="text-muted-foreground">
                  No hidden fees or surprise charges. Know exactly what you're paying for with clear, upfront pricing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
                <p className="text-muted-foreground">
                  Get the support you need when you need it, with priority access for premium and VIP clients.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Experience</h3>
                <p className="text-muted-foreground">
                  Enjoy a premium legal experience with advanced features and personalized service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your client service plan at any time. Changes take effect
                  immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the free plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The Basic Client plan includes case updates, document viewing, email communication, and basic
                  appointment scheduling at no cost.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do video consultations work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Premium and VIP clients can schedule secure video consultations directly through the platform. VIP
                  clients get unlimited access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my information secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use bank-level encryption and are fully compliant with legal industry security
                  standards to protect your information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 opacity-90">
                Choose the plan that's right for you and start getting better legal support today
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" variant="secondary">
                  Start with Basic (Free)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
                >
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
