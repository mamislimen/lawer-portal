import { getServerSession } from 'next-auth'; // ✅ fixed import
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { user: null, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Return minimal user data
    const { id, name, email, role, image } = session.user
    return NextResponse.json({
      user: { id, name, email, role, image },
      expires: session.expires
    })

  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { user: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
