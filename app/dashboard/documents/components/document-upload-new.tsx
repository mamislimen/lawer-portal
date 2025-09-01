'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import DocumentUploadForm from '@/components/document-upload-form'

interface DocumentUploadProps {
  onSuccess?: () => void
}

// Match the Client interface from DocumentUploadForm
interface ClientWithCases {
  id: string
  name: string | null
  email: string  // Make email required to match Client interface
  cases: Array<{
    id: string
    title: string
    status?: string
  }>
}

export function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: clientsData = [] } = useQuery<ClientWithCases[]>({
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
            clients={clientsData.map(client => ({
              ...client,
              email: client.email || '' // Ensure email is always a string
            }))}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
