import { Metadata } from "next"
import { DocumentsClient } from "./documents-client"

export const metadata: Metadata = {
  title: "Documents",
  description: "Manage your legal documents",
}

export default function DocumentsPage() {
  return <DocumentsClient />
}
