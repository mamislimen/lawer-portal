"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Zap } from "lucide-react"

interface FeatureGateProps {
  children: ReactNode
  requiredPlan: "basic" | "premium" | "enterprise"
  currentPlan: "basic" | "premium" | "enterprise"
  featureName: string
  description?: string
}

const planHierarchy = {
  basic: 1,
  premium: 2,
  enterprise: 3,
}

const planIcons = {
  basic: Zap,
  premium: Zap,
  enterprise: Crown,
}

const planColors = {
  basic: "bg-blue-100 text-blue-800 border-blue-200",
  premium: "bg-purple-100 text-purple-800 border-purple-200",
  enterprise: "bg-gold-100 text-gold-800 border-gold-200",
}

export function FeatureGate({ children, requiredPlan, currentPlan, featureName, description }: FeatureGateProps) {
  const hasAccess = planHierarchy[currentPlan] >= planHierarchy[requiredPlan]

  if (hasAccess) {
    return <>{children}</>
  }

  const RequiredIcon = planIcons[requiredPlan]

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{featureName}</h3>

        {description && <p className="text-muted-foreground mb-4 max-w-md">{description}</p>}

        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Requires</span>
          <Badge className={planColors[requiredPlan]}>
            <RequiredIcon className="h-3 w-3 mr-1" />
            {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan
          </Badge>
        </div>

        <div className="flex gap-3">
          <Button className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade Plan
          </Button>
          <Button variant="outline" className="bg-transparent">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Usage example component
export function FeatureGateExample() {
  return (
    <div className="space-y-6">
      <FeatureGate
        requiredPlan="premium"
        currentPlan="basic"
        featureName="AI-Powered Legal Insights"
        description="Get intelligent case analysis, document review assistance, and predictive outcomes powered by advanced AI."
      >
        <div>This content would show for Premium+ users</div>
      </FeatureGate>

      <FeatureGate
        requiredPlan="enterprise"
        currentPlan="premium"
        featureName="White-Label Branding"
        description="Customize the platform with your firm's branding, colors, and logo for a seamless client experience."
      >
        <div>This content would show for Enterprise users</div>
      </FeatureGate>
    </div>
  )
}
