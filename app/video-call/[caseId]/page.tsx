"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import VideoCallRoom from "@/components/video-call/video-call-room"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface VideoCall {
  id: string
  title: string
  description?: string
  hostId: string
  participantId: string
  caseId?: string
  status: string
  scheduledAt: string
  agoraChannelName: string
  host: {
    id: string
    name: string
    email: string
  }
  participant: {
    id: string
    name: string
    email: string
  }
  case?: {
    id: string
    title: string
  }
}

export default function VideoCallPage() {
  const params = useParams()
  const { data: session, status } = useSession()
  const [videoCall, setVideoCall] = useState<VideoCall | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const callId = params.caseId as string

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      setError("You must be signed in to join a video call")
      setLoading(false)
      return
    }

    const fetchVideoCall = async () => {
      try {
        const response = await fetch("/api/video-calls")
        if (!response.ok) {
          throw new Error("Failed to fetch video calls")
        }

        const videoCalls = await response.json()
        const call = videoCalls.find((vc: VideoCall) => vc.id === callId)

        if (!call) {
          setError("Video call not found")
          return
        }

        // Check if user has access to this call
        if (call.hostId !== session.user.id && call.participantId !== session.user.id) {
          setError("You do not have access to this video call")
          return
        }

        setVideoCall(call)
      } catch (error) {
        console.error("Error fetching video call:", error)
        setError("Failed to load video call")
      } finally {
        setLoading(false)
      }
    }

    fetchVideoCall()
  }, [callId, session, status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading video call...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600">Please check the URL or contact support if you believe this is an error.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!videoCall) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Video call not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isHost = videoCall.hostId === session?.user.id

  return <VideoCallRoom callId={videoCall.id} channelName={videoCall.agoraChannelName} isHost={isHost} />
}
