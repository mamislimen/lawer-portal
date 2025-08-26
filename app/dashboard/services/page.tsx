"use client"

import { useState, useEffect } from "react"
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
import { Plus, DollarSign, Clock, Users, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  clientsServed: number;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newService, setNewService] = useState<{
    name: string;
    description: string;
    price: string;
    duration: string;
    category: string;
    status: 'ACTIVE' | 'INACTIVE';
  }>({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    status: 'ACTIVE',
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/services')
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch services')
        }
        
        setServices(data)
      } catch (err) {
        console.error('Error fetching services:', err)
        setError(err instanceof Error ? err.message : 'Failed to load services. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!newService.name || !newService.category || !newService.price || !newService.duration) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const price = parseFloat(newService.price)
      if (isNaN(price) || price <= 0) {
        throw new Error('Please enter a valid price')
      }

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newService.name,
          description: newService.description,
          price: price,
          duration: newService.duration,
          category: newService.category,
          status: newService.status,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to add service'
        throw new Error(errorMessage)
      }

      const createdService = responseData
      setServices([createdService, ...services])
      setIsAddDialogOpen(false)
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        status: 'ACTIVE',
      })
    } catch (err) {
      console.error('Error adding service:', err)
      setError(err instanceof Error ? err.message : 'Failed to add service. Please try again.')
    }
  }

  const handleEditService = (service: Service) => {
    setCurrentService(service)
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      category: service.category,
      status: service.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentService) return

    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentService.id,
          name: newService.name,
          description: newService.description,
          price: parseFloat(newService.price),
          duration: newService.duration,
          category: newService.category,
          status: newService.status,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to update service'
        throw new Error(errorMessage)
      }

      const updatedService = responseData
      setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
      setIsEditDialogOpen(false)
      setCurrentService(null)
      setNewService({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        status: 'ACTIVE',
      })
    } catch (err) {
      console.error('Error updating service:', err)
      setError(err instanceof Error ? err.message : 'Failed to update service. Please try again.')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/services', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: serviceId }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorMessage = responseData.error || responseData.message || 'Failed to delete service'
        throw new Error(errorMessage)
      }

      setServices(services.filter(s => s.id !== serviceId))
    } catch (err) {
      console.error('Error deleting service:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete service. Please try again.')
    }
  }

  const getStatusColor = (status: 'ACTIVE' | 'INACTIVE') => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading services...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
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
              <DialogDescription>Add a new service to your offerings.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddService}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Service Name
                  </Label>
                  <Input 
                    id="name" 
                    className="col-span-3" 
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newService.category}
                    onValueChange={(value) => setNewService({...newService, category: value})}
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                      <SelectItem value="Personal Injury">Personal Injury</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Family Law">Family Law</SelectItem>
                      <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <div className="relative col-span-3">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input 
                      id="price" 
                      type="number"
                      step="0.01"
                      placeholder="0.00" 
                      className="pl-8"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">
                    Duration
                  </Label>
                  <Input 
                    id="duration" 
                    placeholder="1-2 hours" 
                    className="col-span-3"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right mt-2">
                    Description
                  </Label>
                  <Textarea 
                    id="description" 
                    className="col-span-3 min-h-[100px]"
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={newService.status}
                    onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setNewService({...newService, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  Add Service
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateService}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Service Name
                </Label>
                <Input 
                  id="edit-name" 
                  className="col-span-3" 
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) => setNewService({...newService, category: value})}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                    <SelectItem value="Personal Injury">Personal Injury</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Family Law">Family Law</SelectItem>
                    <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Price
                </Label>
                <div className="relative col-span-3">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                  <Input 
                    id="edit-price" 
                    type="number"
                    step="0.01"
                    placeholder="0.00" 
                    className="pl-8"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-duration" className="text-right">
                  Duration
                </Label>
                <Input 
                  id="edit-duration" 
                  placeholder="1-2 hours" 
                  className="col-span-3"
                  value={newService.duration}
                  onChange={(e) => setNewService({...newService, duration: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right mt-2">
                  Description
                </Label>
                <Textarea 
                  id="edit-description" 
                  className="col-span-3 min-h-[100px]"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newService.status}
                  onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setNewService({...newService, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                Update Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
            <div className="text-3xl font-bold">
              {services.filter((s) => s.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients Served</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {services.reduce((sum, service) => sum + (service.clientsServed || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${services.length > 0 
                ? (services.reduce((sum, service) => sum + service.price, 0) / services.length).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6">
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
            <div className="text-center max-w-md space-y-2">
              <h3 className="text-lg font-medium">No services yet</h3>
              <p className="text-sm text-muted-foreground">
                Get started by adding a new service to offer your clients using the "Add New Service" button above.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.category}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {service.description}
                  </p>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>${service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{service.duration}</span>
                      </div>    
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{service.clientsServed} clients</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        Updated {format(new Date(service.updatedAt), 'MMM d, yyyy')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}