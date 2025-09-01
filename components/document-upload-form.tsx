'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import { DocumentType } from '@prisma/client';

interface Client {
  id: string;
  name: string | null;
  email?: string;  // Make email optional to match API response
  cases?: Array<{
    id: string;
    title: string;
    status?: string;
  }>;
}

interface DocumentUploadFormProps {
  clients: Client[];
  onSuccess?: () => void;
}

export default function DocumentUploadForm({ clients, onSuccess }: DocumentUploadFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.OTHER);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Get cases for the selected client
  const selectedClientData = clients.find(c => c.id === selectedClient);
  const cases = selectedClientData?.cases || [];
  
  // Reset selected case when client changes
  useEffect(() => {
    setSelectedCase('');
  }, [selectedClient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !selectedClient) {
      toast({
        title: 'Error',
        description: 'Please select a file and client',
        variant: 'destructive',
      });
      return;
    }
    
    // Case is optional, so we can proceed with or without it

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', selectedClient);
      if (selectedCase) {
        formData.append('caseId', selectedCase);
      }
      formData.append('documentType', documentType);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      // Reset form
      setFile(null);
      setPreview(null);
      setSelectedClient('');
      setSelectedCase('');
      setDocumentType(DocumentType.OTHER);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback to refresh if no callback provided
        router.refresh();
      }
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload Document</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Select a client and case, then upload your document.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="client" className="block text-sm font-medium">
            Client <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={selectedClient} 
            onValueChange={(value) => {
              setSelectedClient(value);
              setSelectedCase(''); // Reset case when client changes
            }}
            disabled={loading || clients.length === 0}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                clients.length === 0 ? 'No clients available' : 'Select a client'
              } />
            </SelectTrigger>
            <SelectContent>
              {clients.length > 0 ? (
                clients.map((client) => {
                  const displayName = client.name || 
                                   (client.email ? client.email.split('@')[0] : '') || 
                                   `Client ${client.id.substring(0, 6)}`;
                  return (
                    <SelectItem key={client.id} value={client.id}>
                      {displayName}
                    </SelectItem>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No clients found in the system
                </div>
              )}
            </SelectContent>
          </Select>
          {clients.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              No clients available. Please add clients before uploading documents.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="case" className="text-sm font-medium">
              Case (Optional)
            </Label>
            <span className="text-xs text-muted-foreground">
              {selectedClient && cases.length > 0 ? `${cases.length} case(s) available` : 'No cases'}
            </span>
          </div>
          
          {selectedClient ? (
            <Select 
              value={selectedCase} 
              onValueChange={setSelectedCase}
              disabled={loading || cases.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  cases.length === 0 ? 'No cases available' : 'Select a case (optional)'
                } />
              </SelectTrigger>
              <SelectContent>
                {cases.length > 0 ? (
                  cases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No cases found for this client
                  </div>
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
              Select a client to see their cases
            </div>
          )}
          
          {selectedClient && cases.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              This client doesn't have any cases yet. You can still upload documents without assigning to a case.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select 
            value={documentType} 
            onValueChange={(value) => setDocumentType(value as DocumentType)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Document</Label>
          <div className="flex items-center gap-4">
            <Label
              htmlFor="file-upload"
              className="flex flex-1 cursor-pointer items-center justify-between rounded-md border border-dashed p-4 hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>{file ? file.name : 'Choose a file'}</span>
              </div>
              <Button type="button" variant="outline" size="sm" className="ml-4">
                Browse
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                disabled={loading}
              />
            </Label>
            {file && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {preview && (
            <div className="mt-2">
              <img 
                src={preview} 
                alt="Preview" 
                className="max-h-40 rounded-md border"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!file || !selectedClient || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
