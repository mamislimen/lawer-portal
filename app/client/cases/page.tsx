import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, FileText, MessageSquare, Eye } from "lucide-react"

const clientCases = [
  {
    id: 1,
    title: "Property Dispute Case",
    description: "Boundary dispute with neighbor regarding property line",
    status: "In Progress",
    priority: "High",
    startDate: "2024-01-15",
    nextHearing: "2024-02-15",
    lawyer: "John Doe",
    estimatedValue: "$50,000",
    documents: 8,
    lastUpdate: "2024-01-20",
  },
  {
    id: 2,
    title: "Employment Contract Review",
    description: "Review and negotiation of new employment agreement",
    status: "Under Review",
    priority: "Medium",
    startDate: "2024-01-18",
    nextHearing: "N/A",
    lawyer: "John Doe",
    estimatedValue: "$25,000",
    documents: 3,
    lastUpdate: "2024-01-19",
  },
  {
    id: 3,
    title: "Personal Injury Claim",
    description: "Motor vehicle accident compensation claim",
    status: "Active",
    priority: "High",
    startDate: "2024-01-10",
    nextHearing: "2024-02-10",
    lawyer: "John Doe",
    estimatedValue: "$75,000",
    documents: 15,
    lastUpdate: "2024-01-21",
  },
]

export default function ClientCasesPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">My Cases</h1>
        <p className="text-muted-foreground text-lg">Track the progress of your legal matters.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientCases.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{clientCases.filter((c) => c.status !== "Closed").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$150K</div>
            <p className="text-xs text-muted-foreground">Combined case value</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {clientCases.map((caseItem) => (
          <Card key={caseItem.id} className="border-2 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                    <Badge className={getPriorityColor(caseItem.priority)}>{caseItem.priority}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Started: {caseItem.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>Value: {caseItem.estimatedValue}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{caseItem.documents} documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Next: {caseItem.nextHearing}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Lawyer:</strong> {caseItem.lawyer}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <MessageSquare className="h-4 w-4" />
                    Message Lawyer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
