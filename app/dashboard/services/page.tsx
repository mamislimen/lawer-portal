"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, DollarSign, Clock, Users, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const mockServices = [
  {
    id: 1,
    name: "Corporate Law Consultation",
    description:
      "Comprehensive legal advice for corporate matters including contracts, compliance, and business structure.",
    price: "$300/hour",
    duration: "1-2 hours",
    category: "Corporate Law",
    status: "Active",
    clientsServed: 45,
  },
  {
    id: 2,
    name: "Personal Injury Representation",
    description:
      "Full legal representation for personal injury cases including motor vehicle accidents and workplace injuries.",
    price: "$500/hour",
    duration: "Varies",
    category: "Personal Injury",
    status: "Active",
    clientsServed: 32,
  },
  {
    id: 3,
    name: "Real Estate Transaction",
    description: "Legal services for property purchases, sales, and lease agreements.",
    price: "$250/hour",
    duration: "2-4 hours",
    category: "Real Estate",
    status: "Active",
    clientsServed: 28,
  },
  {
    id: 4,
    name: "Family Law Mediation",
    description: "Mediation services for divorce, custody, and family disputes.",
    price: "$200/hour",
    duration: "1-3 hours",
    category: "Family Law",
    status: "Active",
    clientsServed: 18,
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState(mockServices)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground text-lg">Manage the legal services you offer to clients.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>Create a new service offering for your clients.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serviceName" className="text-right">
                  Service Name
                </Label>
                <Input id="serviceName" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate Law</SelectItem>
                    <SelectItem value="personal-injury">Personal Injury</SelectItem>
                    <SelectItem value="real-estate">Real Estate</SelectItem>
                    <SelectItem value="family">Family Law</SelectItem>
                    <SelectItem value="criminal">Criminal Law</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Price
                </Label>
                <Input id="price" placeholder="$0/hour" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input id="duration" placeholder="1-2 hours" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serviceDescription" className="text-right">
                  Description
                </Label>
                <Textarea id="serviceDescription" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsAddDialogOpen(false)}>
                Add Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Available services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{services.filter((s) => s.status === "Active").length}</div>
            <p className="text-xs text-muted-foreground">Currently offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {services.reduce((sum, service) => sum + service.clientsServed, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$312</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="border-2 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01"
                        />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Service
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{service.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{service.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{service.clientsServed} clients served</span>
                </div>
              </div>

              <div className="pt-2">
                <Badge variant="outline" className="text-xs">
                  {service.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
