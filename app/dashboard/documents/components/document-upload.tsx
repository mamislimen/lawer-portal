'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import DocumentUploadForm from '@/components/document-upload-form'

interface DocumentUploadProps {
  onSuccess?: () => void
}

interface ClientWithCases {
  id: string
  name: string
  email: string
  cases: Array<{
    id: string
    title: string
  }>
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: clients = [] } = useQuery<ClientWithCases[]>({
    queryKey: ['clients-with-cases'],
    queryFn: async () => {
      const response = await fetch('/api/clients/with-cases')
      if (!response.ok) {
        throw new Error('Failed to fetch clients with cases')
      }
      return response.json()
    },
  })

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Select a client and case, then upload the document file.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <DocumentUploadForm 
            clients={clients}
            onSuccess={handleSuccess}
          />
        </div>
        <DialogFooter>
          {/* Button will be handled inside NewDocumentUploadForm */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
