"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff, Users } from "lucide-react"
import { getAgoraService, type AgoraConfig } from "@/lib/agora"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

interface VideoCallRoomProps {
  callId: string
  channelName: string
  isHost?: boolean
}

export default function VideoCallRoom({ callId, channelName, isHost = false }: VideoCallRoomProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<number[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const agoraService = useRef(getAgoraService())
  const callStartTime = useRef<Date | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isJoined && callStartTime.current) {
      durationInterval.current = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTime.current!.getTime()) / 1000)
        setCallDuration(duration)
      }, 1000)
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [isJoined])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const generateAgoraToken = async (): Promise<AgoraConfig> => {
    const response = await fetch("/api/agora/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelName,
        uid: Number.parseInt(session?.user.id || "0"),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate Agora token")
    }

    return response.json()
  }

  const joinCall = async () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      const config = await generateAgoraToken()

      await agoraService.current.join(config)
      await agoraService.current.createLocalTracks()
      await agoraService.current.publish()

      // Play local video
      setTimeout(() => {
        agoraService.current.playLocalVideo("local-video")
      }, 100)

      setIsJoined(true)
      callStartTime.current = new Date()

      // Update call status to IN_PROGRESS
      await fetch(`/api/video-calls?id=${callId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      })

      toast({
        title: "Joined Call",
        description: "You have successfully joined the video call",
      })
    } catch (error) {
      console.error("Failed to join call:", error)
      toast({
        title: "Error",
        description: "Failed to join the video call",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCall = async () => {
    try {
      await agoraService.current.leave()
      setIsJoined(false)
      callStartTime.current = null

      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }

      // Update call status to COMPLETED
      await fetch(`/api/video-calls?id=${callId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          duration: callDuration,
        }),
      })

      toast({
        title: "Call Ended",
        description: "You have left the video call",
      })

      router.push("/dashboard/video-calls")
    } catch (error) {
      console.error("Failed to leave call:", error)
      toast({
        title: "Error",
        description: "Failed to leave the call properly",
        variant: "destructive",
      })
    }
  }

  const toggleMicrophone = async () => {
    try {
      const enabled = await agoraService.current.toggleMicrophone()
      setIsAudioEnabled(enabled)

      toast({
        title: enabled ? "Microphone On" : "Microphone Off",
        description: enabled ? "Your microphone is now enabled" : "Your microphone is now muted",
      })
    } catch (error) {
      console.error("Failed to toggle microphone:", error)
    }
  }

  const toggleCamera = async () => {
    try {
      const enabled = await agoraService.current.toggleCamera()
      setIsVideoEnabled(enabled)

      toast({
        title: enabled ? "Camera On" : "Camera Off",
        description: enabled ? "Your camera is now enabled" : "Your camera is now disabled",
      })
    } catch (error) {
      console.error("Failed to toggle camera:", error)
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await agoraService.current.stopScreenShare()
        setIsScreenSharing(false)
        toast({
          title: "Screen Share Stopped",
          description: "You have stopped sharing your screen",
        })
      } else {
        await agoraService.current.startScreenShare()
        setIsScreenSharing(true)
        toast({
          title: "Screen Share Started",
          description: "You are now sharing your screen",
        })
      }
    } catch (error) {
      console.error("Failed to toggle screen share:", error)
      toast({
        title: "Error",
        description: "Failed to toggle screen sharing",
        variant: "destructive",
      })
    }
  }

  // Update remote users when they join/leave
  useEffect(() => {
    const updateRemoteUsers = () => {
      const users = agoraService.current.getRemoteUsers()
      setRemoteUsers(users)
    }

    // Check for remote users periodically
    const interval = setInterval(updateRemoteUsers, 1000)

    return () => clearInterval(interval)
  }, [isJoined])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Video Call</h1>
          {isJoined && (
            <Badge variant="secondary" className="bg-green-600">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              Live - {formatDuration(callDuration)}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-white border-white">
            <Users className="w-4 h-4 mr-1" />
            {remoteUsers.length + (isJoined ? 1 : 0)}
          </Badge>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        {!isJoined ? (
          <div className="flex items-center justify-center h-96">
            <Card className="w-96 bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h2 className="text-xl font-semibold mb-2 text-white">Ready to Join?</h2>
                <p className="text-gray-400 mb-6">Click the button below to join the video call</p>
                <Button onClick={joinCall} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Joining..." : "Join Call"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-96">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div id="local-video" className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                You {isHost && "(Host)"}
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <VideoOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Remote Videos */}
            {remoteUsers.map((uid) => (
              <div key={uid} className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div id={`player-${uid}`} className="w-full h-full" />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  User {uid}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - remoteUsers.length - 1) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2" />
                  <p>Waiting for participant...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      {isJoined && (
        <div className="bg-gray-800 p-4">
          <div className="flex justify-center space-x-4">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleMicrophone}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleCamera}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-12 h-12 p-0"
            >
              {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={leaveCall}
              className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
