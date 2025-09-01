"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, DollarSign, Edit, Trash2, Loader2, Briefcase, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface LawyerCase {
  id: string
  title: string
  description: string
  status: string
  priority: string
  clientName: string
  clientEmail: string
  createdAt: string
  hasPricing: boolean
  pricingStatus: string | null
  currentPrice: number | null
}

interface CasePricing {
  id: string
  caseId: string
  caseTitle: string
  clientName: string
  basePrice: number
  hourlyRate: number
  estimatedHours: number
  totalEstimate: number
  description: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'PAID'
  createdAt: string
}

export default function PricingPage() {
  const [casePricings, setCasePricings] = useState<CasePricing[]>([])
  const [lawyerCases, setLawyerCases] = useState<LawyerCase[]>([])
  const [loading, setLoading] = useState(true)
  const [casesLoading, setCasesLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState<CasePricing | null>(null)
  const [selectedCase, setSelectedCase] = useState<LawyerCase | null>(null)
  const [formData, setFormData] = useState({
    caseId: '',
    basePrice: '',
    hourlyRate: '',
    estimatedHours: '',
    description: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchCasePricings()
    fetchLawyerCases()
  }, [])

  const fetchCasePricings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lawyer/case-pricing')
      if (!response.ok) throw new Error('Failed to fetch case pricing')
      const data = await response.json()
      setCasePricings(data)
    } catch (error) {
      console.error('Error fetching case pricing:', error)
      toast({
        title: "Error",
        description: "Failed to load case pricing data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchLawyerCases = async () => {
    try {
      setCasesLoading(true)
      const response = await fetch('/api/lawyer/cases')
      if (!response.ok) throw new Error('Failed to fetch cases')
      const data = await response.json()
      setLawyerCases(data)
    } catch (error) {
      console.error('Error fetching cases:', error)
      toast({
        title: "Error",
        description: "Failed to load cases",
        variant: "destructive"
      })
    } finally {
      setCasesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const basePrice = parseFloat(formData.basePrice)
      const hourlyRate = parseFloat(formData.hourlyRate)
      const estimatedHours = parseFloat(formData.estimatedHours)
      
      const payload = {
        ...formData,
        basePrice,
        hourlyRate,
        estimatedHours,
        totalEstimate: basePrice + (hourlyRate * estimatedHours)
      }

      const url = selectedPricing 
        ? `/api/lawyer/case-pricing/${selectedPricing.id}`
        : '/api/lawyer/case-pricing'
      
      const method = selectedPricing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to save pricing')

      toast({
        title: "Success",
        description: `Case pricing ${selectedPricing ? 'updated' : 'created'} successfully`
      })

      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedPricing(null)
      setSelectedCase(null)
      setFormData({ caseId: '', basePrice: '', hourlyRate: '', estimatedHours: '', description: '' })
      fetchCasePricings()
      fetchLawyerCases()
    } catch (error) {
      console.error('Error saving pricing:', error)
      toast({
        title: "Error",
        description: "Failed to save case pricing",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (pricing: CasePricing) => {
    setSelectedPricing(pricing)
    setFormData({
      caseId: pricing.caseId,
      basePrice: pricing.basePrice.toString(),
      hourlyRate: pricing.hourlyRate.toString(),
      estimatedHours: pricing.estimatedHours.toString(),
      description: pricing.description
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/lawyer/case-pricing/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete pricing')
      
      toast({
        title: "Success",
        description: "Case pricing deleted successfully"
      })
      fetchCasePricings()
    } catch (error) {
      console.error('Error deleting pricing:', error)
      toast({
        title: "Error",
        description: "Failed to delete case pricing",
        variant: "destructive"
      })
    }
  }

  const sendPricingToClient = async (id: string) => {
    try {
      const response = await fetch(`/api/lawyer/case-pricing/${id}/send`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to send pricing')
      
      toast({
        title: "Success",
        description: "Pricing sent to client successfully"
      })
      fetchCasePricings()
    } catch (error) {
      console.error('Error sending pricing:', error)
      toast({
        title: "Error",
        description: "Failed to send pricing to client",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'PAID': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading pricing data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Case Pricing</h1>
          <p className="text-muted-foreground text-lg">Set prices for your cases and send quotes to clients.</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Case Pricing
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Case Pricing</DialogTitle>
                <DialogDescription>Select a case and set pricing details to send to your client.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="caseSelect" className="text-right">Case</Label>
                  <Select 
                    value={formData.caseId} 
                    onValueChange={(value) => setFormData({...formData, caseId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a case to price" />
                    </SelectTrigger>
                    <SelectContent>
                      {casesLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading cases...
                        </SelectItem>
                      ) : (
                        lawyerCases.filter(c => !c.hasPricing).map((caseItem) => (
                          <SelectItem key={caseItem.id} value={caseItem.id}>
                            {caseItem.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="basePrice" className="text-right">Base Price</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                    placeholder="0.00"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hourlyRate" className="text-right">Hourly Rate</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    placeholder="0.00"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estimatedHours" className="text-right">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                    placeholder="0"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the work to be done..."
                    className="col-span-3"
                  />
                </div>
                {formData.basePrice && formData.hourlyRate && formData.estimatedHours && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right font-semibold">Total Estimate</Label>
                    <div className="col-span-3 text-lg font-semibold text-green-600">
                      ${(parseFloat(formData.basePrice) + (parseFloat(formData.hourlyRate) * parseFloat(formData.estimatedHours))).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Add Pricing</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{casePricings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{casePricings.filter(p => p.status === 'SENT').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{casePricings.filter(p => p.status === 'ACCEPTED').length}</div>
            <p className="text-xs text-muted-foreground">Ready for payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${casePricings.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.totalEstimate, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">From paid cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Case Pricing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {casePricings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No case pricing found. Create your first quote to get started.
                  </TableCell>
                </TableRow>
              ) : (
                casePricings.map((pricing) => (
                  <TableRow key={pricing.id}>
                    <TableCell className="font-medium">{pricing.caseTitle}</TableCell>
                    <TableCell>{pricing.clientName}</TableCell>
                    <TableCell>${pricing.basePrice.toFixed(2)}</TableCell>
                    <TableCell>${pricing.hourlyRate.toFixed(2)}</TableCell>
                    <TableCell>{pricing.estimatedHours}h</TableCell>
                    <TableCell className="font-semibold">${pricing.totalEstimate.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pricing.status)}>{pricing.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {pricing.status === 'DRAFT' && (
                            <DropdownMenuItem onClick={() => sendPricingToClient(pricing.id)}>
                              Send to Client
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEdit(pricing)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(pricing.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Case Pricing</DialogTitle>
              <DialogDescription>Update pricing details for this case.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-basePrice" className="text-right">Base Price</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-hourlyRate" className="text-right">Hourly Rate</Label>
                <Input
                  id="edit-hourlyRate"
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-estimatedHours" className="text-right">Est. Hours</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Pricing</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
