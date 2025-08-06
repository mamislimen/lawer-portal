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
    if (!session?.user?.id) {
      throw new Error("User ID is missing")
    }
    
    const response = await fetch("/api/agora/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelName,
        uid: Number.parseInt(session.user.id), // Ensure the user ID is available
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

      setTimeout(() => {
        agoraService.current.playLocalVideo("local-video")
      }, 100)

      setIsJoined(true)
      callStartTime.current = new Date()

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

  useEffect(() => {
    const updateRemoteUsers = () => {
      const users = agoraService.current.getRemoteUsers()
      setRemoteUsers(users)
    }

    const interval = setInterval(updateRemoteUsers, 1000)

    return () => clearInterval(interval)
  }, [isJoined])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Video Call UI */}
      {/* The full UI code goes here, unchanged from your example */}
    </div>
  )
}
