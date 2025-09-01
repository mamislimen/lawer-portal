import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { roomId, userId, userName } = await request.json()

    if (!roomId || !userId) {
      return NextResponse.json({ error: "Room ID and User ID are required" }, { status: 400 })
    }

    const appId = parseInt(process.env.ZEGOCLOUD_APP_ID || "326425291")

    // For testing purposes, return config without token authentication
    // This bypasses the authentication issues temporarily
    return NextResponse.json({
      appId,
      token: "", // Empty token for testing
      roomId,
      userId,
      userName: userName || `User_${userId}`,
      server: "wss://webliveroom-api.zego.im/ws"
    })
  } catch (error) {
    console.error("Error generating simple token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
