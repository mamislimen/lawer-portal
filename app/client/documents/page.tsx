"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Upload, Search, FileText, Download, Eye, Calendar, Folder } from "lucide-react"

const mockDocuments = [
  {
    id: 1,
    name: "Property Survey Report.pdf",
    type: "Evidence",
    case: "Property Dispute Case",
    uploadDate: "2024-01-20",
    size: "2.4 MB",
    status: "Reviewed",
    uploadedBy: "You",
  },
  {
    id: 2,
    name: "Medical Records.pdf",
    type: "Evidence",
    case: "Personal Injury Claim",
    uploadDate: "2024-01-18",
    size: "1.8 MB",
    status: "Under Review",
    uploadedBy: "You",
  },
  {
    id: 3,
    name: "Settlement Agreement Draft.docx",
    type: "Legal Document",
    case: "Property Dispute Case",
    uploadDate: "2024-01-22",
    size: "156 KB",
    status: "Requires Signature",
    uploadedBy: "John Doe",
  },
  {
    id: 4,
    name: "Employment Contract.pdf",
    type: "Contract",
    case: "Employment Contract Review",
    uploadDate: "2024-01-15",
    size: "892 KB",
    status: "Signed",
    uploadedBy: "You",
  },
  {
    id: 5,
    name: "Court Filing Receipt.pdf",
    type: "Court Document",
    case: "Personal Injury Claim",
    uploadDate: "2024-01-25",
    size: "245 KB",
    status: "Filed",
    uploadedBy: "John Doe",
  },
]

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.case.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reviewed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Requires Signature":
        return "bg-red-100 text-red-800 border-red-200"
      case "Signed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Filed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-lg">Access and manage your case documents.</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a document related to your case.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input id="file" type="file" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="case" className="text-right">
                  Related Case
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property Dispute Case</SelectItem>
                    <SelectItem value="injury">Personal Injury Claim</SelectItem>
                    <SelectItem value="contract">Employment Contract Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="docType" className="text-right">
                  Document Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="medical">Medical Records</SelectItem>
                    <SelectItem value="financial">Financial Documents</SelectItem>
                    <SelectItem value="correspondence">Correspondence</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsUploadDialogOpen(false)}>
                Upload Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">All cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documents.filter((d) => d.status === "Under Review").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting lawyer review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Require Signature</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {documents.filter((d) => d.status === "Requires Signature").length}
            </div>
            <p className="text-xs text-muted-foreground">Action needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5.5 MB</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Related Case</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.name)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <p className="text-sm text-muted-foreground">{document.size}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.type}</Badge>
                  </TableCell>
                  <TableCell>{document.case}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                  </TableCell>
                  <TableCell>{document.uploadedBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
