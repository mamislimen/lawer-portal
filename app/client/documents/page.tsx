"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"

interface Document {
  id: number;
  name: string;
  type: string;
  case: string;
  uploadDate: string;
  size: string;
  status: string;
  uploadedBy: string;
}

export default function ClientDocumentsPage() {
  // State for documents and UI
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('CONTRACT')
  const [caseId, setCaseId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc: Document) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      doc.name.toLowerCase().includes(searchTermLower) ||
      doc.type.toLowerCase().includes(searchTermLower) ||
      (doc.case && doc.case.toLowerCase().includes(searchTermLower))
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (caseId) formData.append('caseId', caseId)
      formData.append('type', documentType)

      const response = await fetch('/api/client/documents', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const result = await response.json()
      
      // Add the new document to the list
      setDocuments(prev => [{
        ...result.document,
        case: caseId || 'Uncategorized',
        uploadedBy: 'You',
        status: 'Uploaded'
      }, ...prev])
      
      // Reset form
      setSelectedFile(null)
      setDocumentType('CONTRACT')
      setCaseId(null)
      setIsUploadDialogOpen(false)
      
      toast.success('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleViewDocument = async (documentId: string, documentName: string) => {
    try {
      // Open the document in a new tab
      window.open(`/api/client/documents/${documentId}?view=true`, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to open document. Please try again.');
    }
  };

  const handleDownloadDocument = async (documentId: string, documentName: string) => {
    try {
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = `/api/client/documents/${documentId}`;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };



  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/client/documents')
        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }
        const data = await response.json()
        setDocuments(data)
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError('Failed to load documents. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])


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
    const iconClass = "h-4 w-4 text-muted-foreground"
    
    switch(extension) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />
      case 'xls':
      case 'xlsx':
        return <FileText className={`${iconClass} text-green-600`} />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className={`${iconClass} text-purple-500`} />
      default:
        return <FileText className={iconClass} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground text-lg">Manage and review your legal documents.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {isLoading && <p>Loading documents...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && documents.length === 0 && (
            <p className="text-muted-foreground">No documents found.</p>
          )}
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
                <DialogDescription>
                  Select a file to upload. It will be available in your documents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="document" className="text-right">
                    Document
                  </Label>
                  <Input
                    id="document"
                    type="file"
                    className="col-span-3"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Document Type
                  </Label>
                  <Select 
                    value={documentType}
                    onValueChange={setDocumentType}
                    disabled={isUploading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="EVIDENCE">Evidence</SelectItem>
                      <SelectItem value="CORRESPONDENCE">Correspondence</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleViewDocument(document.id.toString(), document.name)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleDownloadDocument(document.id.toString(), document.name)}
                      >
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
