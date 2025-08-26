import { NextResponse } from "next/server"
import { getServerSession, type DefaultSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module 'next-auth' {
  interface Session {
    user: {
      lawyerId: any
      id: string
      name?: string | null
      email: string
      image?: string | null
      role: 'CLIENT' | 'LAWYER' | 'ADMIN'
    }
    sessionToken?: string
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { currentPassword, newPassword } = await request.json()
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return new NextResponse(
        JSON.stringify({ error: 'Current password and new password are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (newPassword.length < 8) {
      return new NextResponse(
        JSON.stringify({ error: 'New password must be at least 8 characters long' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the current user with their password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, email: true }
    })

    if (!user?.password) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return new NextResponse(
        JSON.stringify({ error: 'Current password is incorrect' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return new NextResponse(
        JSON.stringify({ error: 'New password must be different from current password' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the password and invalidate all sessions in a transaction
    await prisma.$transaction([
      // First, update the password
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          password: hashedPassword
        }
      }),
      
      // Then, delete all sessions except the current one
      prisma.session.deleteMany({
        where: { 
          userId: session.user.id,
          ...(session.sessionToken && { sessionToken: { not: session.sessionToken } })
        }
      })
    ])

    return new NextResponse(
      JSON.stringify({ message: 'Password updated successfully' }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error("Error updating password:", error)
    return new NextResponse(
      JSON.stringify({ error: 'An error occurred while updating your password' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
