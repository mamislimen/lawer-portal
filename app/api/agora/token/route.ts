import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RtcTokenBuilder, RtcRole } from "agora-access-token"

// POST /api/agora/token - Generate Agora RTC token
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { channelName, uid } = await request.json()

    if (!channelName) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 })
    }

    const appId = process.env.AGORA_APP_ID!
    const appCertificate = process.env.AGORA_APP_CERTIFICATE!
    const role = RtcRole.PUBLISHER
    const expirationTimeInSeconds = 3600 // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      role,
      privilegeExpiredTs,
    )

    return NextResponse.json({
      token,
      appId,
      channelName,
      uid: uid || 0,
    })
  } catch (error) {
    console.error("Error generating Agora token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
