"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, ImageIcon, FileText, Download, Eye, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Document {
  id: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
  url: string
  type: string
  createdAt: string
  uploader: {
    id: string
    name: string
    email: string
  }
  case?: {
    id: string
    title: string
  }
}

interface FileUploadProps {
  caseId?: string
  onUploadComplete?: (document: Document) => void
  existingDocuments?: Document[]
  allowedTypes?: string[]
  maxSize?: number
}

export default function FileUpload({
  caseId,
  onUploadComplete,
  existingDocuments = [],
  allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
    "text/plain",
  ],
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documents, setDocuments] = useState<Document[]>(existingDocuments)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, image, or text file.",
          variant: "destructive",
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB.`,
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("file", file)
        if (caseId) formData.append("caseId", caseId)
        formData.append("type", getDocumentType(file.type))

        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (response.ok) {
          const newDoc = await response.json()
          setDocuments((prev) => [newDoc, ...prev])
          onUploadComplete?.(newDoc)

          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded successfully.`,
          })
        } else {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "Failed to upload file.",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [allowedTypes, maxSize, caseId, onUploadComplete],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  })

  const getDocumentType = (mimeType: string): string => {
    if (mimeType.includes("pdf")) return "CONTRACT"
    if (mimeType.includes("image")) return "EVIDENCE"
    if (mimeType.includes("word") || mimeType.includes("text")) return "CORRESPONDENCE"
    return "OTHER"
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />
    if (mimeType.includes("image")) return <ImageIcon className="w-5 h-5 text-green-500" />
    if (mimeType.includes("word")) return <FileText className="w-5 h-5 text-blue-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/upload?id=${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
        toast({
          title: "Document Deleted",
          description: "The document has been deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete document")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete the document.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

            {uploading ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? "Drop the file here" : "Drag & drop a file here"}
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to select a file</p>
                <Button variant="outline" disabled={uploading}>
                  Choose File
                </Button>
                <p className="text-xs text-gray-400 mt-2">
                  Supported: PDF, Word, Images, Text files (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.mimeType)}
                    <div>
                      <p className="font-medium text-sm">{doc.originalName}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span>by {doc.uploader.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.type}
                    </Badge>

                    <Button variant="ghost" size="sm" onClick={() => window.open(doc.url, "_blank")}>
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (doc?.url && doc?.originalName) {
                          const link = document.createElement("a")
                          link.href = doc.url
                          link.download = doc.originalName
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        } else {
                          console.error("Document properties are missing or undefined")
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
