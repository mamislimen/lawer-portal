// client/layout.tsx
import type { ReactNode } from "react"
import { ClientSidebar } from "@/components/client/client-sidebar"
import { ClientHeader } from "@/components/client/client-header"

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <ClientSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <ClientHeader />
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-gradient-to-br from-white to-gray-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
