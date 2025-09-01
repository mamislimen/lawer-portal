import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"

// ZegoCloud token generation - simplified approach
function generateZegoToken(appId: number, userId: string, secret: string, effectiveTimeInSeconds: number = 7200): string {
  const currentTime = Math.floor(Date.now() / 1000)
  
  // Simplified payload that works with ZegoCloud
  const payload = {
    iss: appId,
    exp: currentTime + effectiveTimeInSeconds
  }

  const header = {
    alg: "HS256",
    typ: "JWT"
  }

  // Standard JWT encoding
  const base64UrlEncode = (obj: any): string => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const encodedHeader = base64UrlEncode(header)
  const encodedPayload = base64UrlEncode(payload)
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId, userId } = await request.json()

    if (!roomId || !userId) {
      return NextResponse.json({ error: "Room ID and User ID are required" }, { status: 400 })
    }

    const appId = parseInt(process.env.ZEGOCLOUD_APP_ID!)
    const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET!

    if (!appId || !serverSecret) {
      return NextResponse.json({ error: "ZegoCloud configuration missing" }, { status: 500 })
    }

    const token = generateZegoToken(appId, userId, serverSecret)

    return NextResponse.json({
      appId,
      token,
      roomId,
      userId,
      userName: session.user.name || `User_${userId}`
    })
  } catch (error) {
    console.error("Error generating ZegoCloud token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}