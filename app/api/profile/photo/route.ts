import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public/uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename with UUID and timestamp
    const fileExt = file.name.split('.').pop()
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const fileName = `${uniqueId}.${fileExt}`
    const filePath = join(uploadsDir, fileName)
    
    // Save file to the filesystem
    await writeFile(filePath, buffer)
    
    // Construct the public URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const imageUrl = `${baseUrl}/uploads/${fileName}`
    
    // Update the user's profile with the new image URL
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        image: imageUrl,
        updatedAt: new Date() // Force update to trigger any hooks
      },
      select: { 
        id: true, 
        image: true,
        name: true,
        email: true
      }
    })
    
    // Update the session with the new user data
    const updatedSession = await getServerSession(authOptions)
    if (updatedSession) {
      updatedSession.user = {
        ...updatedSession.user,
        image: imageUrl
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile photo:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
