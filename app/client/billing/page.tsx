"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { DollarSign, Calendar, Download, CreditCard, Clock, AlertCircle } from "lucide-react"

const mockInvoices = [
  {
    id: "INV-001",
    date: "2024-01-20",
    description: "Legal consultation and case preparation",
    amount: 1500.0,
    status: "Paid",
    dueDate: "2024-01-30",
    paidDate: "2024-01-25",
  },
  {
    id: "INV-002",
    date: "2024-01-15",
    description: "Document review and contract analysis",
    amount: 800.0,
    status: "Paid",
    dueDate: "2024-01-25",
    paidDate: "2024-01-22",
  },
  {
    id: "INV-003",
    date: "2024-01-25",
    description: "Court filing fees and legal representation",
    amount: 2200.0,
    status: "Pending",
    dueDate: "2024-02-05",
    paidDate: null,
  },
]

const mockTimeEntries = [
  {
    id: 1,
    date: "2024-01-20",
    lawyer: "John Doe",
    description: "Case strategy meeting and evidence review",
    hours: 2.5,
    rate: 300,
    amount: 750,
  },
  {
    id: 2,
    date: "2024-01-18",
    lawyer: "John Doe",
    description: "Document preparation and client consultation",
    hours: 1.5,
    rate: 300,
    amount: 450,
  },
  {
    id: 3,
    date: "2024-01-22",
    lawyer: "Sarah Wilson",
    description: "Legal research and case analysis",
    hours: 3.0,
    rate: 250,
    amount: 750,
  },
]

export default function ClientBillingPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Overdue":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const totalBilled = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalPaid = mockInvoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalPending = mockInvoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground text-lg">View your invoices and payment history.</p>
        </div>
        <Button className="gap-2">
          <CreditCard className="h-4 w-4" />
          Update Payment Method
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalBilled.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,200</div>
            <p className="text-xs text-muted-foreground">Current month charges</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs font-medium">VISA</div>
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

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(invoice.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />${invoice.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      {invoice.status === "Pending" && (
                        <Button size="sm" className="gap-2">
                          <CreditCard className="h-4 w-4" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Lawyer</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTimeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{entry.lawyer}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {entry.hours}h
                    </div>
                  </TableCell>
                  <TableCell>${entry.rate}/hr</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />${entry.amount.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex justify-between items-center">
            <span className="font-medium">Total Time Charges:</span>
            <span className="text-lg font-bold">
              ${mockTimeEntries.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
