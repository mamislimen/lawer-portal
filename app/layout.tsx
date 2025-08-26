// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AuthProvider } from "@/components/providers/auth-provider"
import { QueryProvider } from "@/providers/QueryProvider"
import { Toaster } from "@/components/ui/toaster"
import { AgoraProvider } from "@/contexts/AgoraContext"
import { SocketProvider } from "@/components/providers/socket-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LegalPortal - Modern Law Firm Management",
  description: "Comprehensive legal practice management platform",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider session={session}>
            <AgoraProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </AgoraProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
