'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DocumentUploadProps {
  onSuccess?: () => void
}

interface Case {
  id: string
  title: string
}

interface UploadResponse {
  url: string
  key: string
  name: string
  type: string
  size: number
}

async function uploadDocument(file: File, caseId: string): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('caseId', caseId)

  const response = await fetch('/api/documents', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload document')
  }

  const data = await response.json()
  return {
    url: data.url,
    key: data.key,
    name: data.name,
    type: data.type,
    size: data.size
  }
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [cases, setCases] = useState<Case[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Fetch cases when dialog opens
  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const response = await fetch('/api/cases?status=OPEN&status=IN_PROGRESS')
      if (!response.ok) {
        throw new Error('Failed to fetch cases')
      }
      const data = await response.json()
      return data.cases || data
    },
    enabled: isOpen,
  })

  // Update cases state when data is loaded
  useEffect(() => {
    if (casesData) {
      const cases = Array.isArray(casesData) ? casesData : casesData.cases || []
      setCases(cases)
    }
  }, [casesData])

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected')
      return uploadDocument(selectedFile, selectedCaseId)
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      setIsOpen(false)
      setSelectedFile(null)
      setSelectedCaseId('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload document')
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return toast.error('Please select a file')
    if (!selectedCaseId) return toast.error('Please select a case')
    uploadMutation.mutate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a document to associate with a case.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">File</Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, PNG, JPG (max 10MB)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="case" className="text-right">Case</Label>
              <div className="col-span-3">
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId} disabled={isCasesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCasesLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!selectedFile || !selectedCaseId || uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
