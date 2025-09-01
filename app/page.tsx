import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  // If not authenticated, redirect to sign-in
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  // Redirect based on role
  if (session.user.role === 'CLIENT') {
    redirect('/client')
  } else {
    redirect('/dashboard')
  }
}
