"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        if (status === 'authenticated' && session?.user) {
          // Type assertion for the session user with role
          const user = session.user as { role?: string }
          const userRole = (user.role || '').toUpperCase() as 'CLIENT' | 'LAWYER' | 'ADMIN';
          
          console.log('User role:', userRole); // Debug log
          
          // Redirect based on user role
          switch (userRole) {
            case 'CLIENT':
              router.push('/client');
              break;
            case 'LAWYER':
              router.push('/dashboard/clients');
              break;
            case 'ADMIN':
              router.push('/admin');
              break;
            default:
              setError('Unauthorized access. Your role is not recognized.');
          }
        } else if (status === 'unauthenticated') {
          router.push('/auth/signin')
        }
      } catch (err) {
        console.error('Error during redirect:', err)
        setError('An error occurred while processing your request.')
      }
    }

    handleRedirect()
  }, [status, session, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Access Error</h2>
        </div>
        <p className="text-center text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Show loading state while checking auth status
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading dashboard...</p>
    </div>
  )
}
