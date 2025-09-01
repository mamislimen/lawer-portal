"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff, Users, Play } from "lucide-react"
import { getZegoService, type ZegoConfig } from "@/lib/zegocloud"
import { useSession } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

interface VideoCallRoomProps {
  callId: string
  roomName: string
  isHost?: boolean
}

export default function VideoCallRoom({ callId, roomName, isHost = false }: VideoCallRoomProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<number[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false)

  const zegoService = useRef(getZegoService())
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

  const generateZegoToken = async (): Promise<ZegoConfig> => {
    if (!session?.user?.id) {
      throw new Error("User ID is missing")
    }
    
    const response = await fetch("/api/zegocloud/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId: roomName,
        userId: session.user.id,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate ZegoCloud token")
    }

    return response.json()
  }

  const joinCall = async () => {
    if (!session?.user) return

    setIsLoading(true)
    try {
      console.log('Starting video call with enhanced device handling...')
      
      // First, get a list of available devices
      let availableDevices: MediaDeviceInfo[] = []
      try {
        availableDevices = await navigator.mediaDevices.enumerateDevices()
        console.log('Available devices:', availableDevices)
      } catch (enumError) {
        console.warn('Device enumeration failed:', enumError)
      }
      
      // Try to get media stream with different approaches
      let mediaStream: MediaStream | null = null
      let lastError: Error | null = null
      
      // Try different constraint sets in sequence
      const constraintSets = [
        // 1. Ideal constraints for most modern browsers
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        },
        // 2. Basic HD constraints
        {
          video: {
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            frameRate: { min: 15, ideal: 30 }
          },
          audio: true
        },
        // 3. Any resolution
        {
          video: true,
          audio: true
        },
        // 4. Video only
        {
          video: true,
          audio: false
        }
      ]
      
      // Try each constraint set until one works
      for (const constraints of constraintSets) {
        try {
          console.log('Trying constraints:', constraints)
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
          console.log('✅ Got media stream with constraints:', constraints)
          break // Exit loop if successful
        } catch (err) {
          lastError = err as Error
          console.warn('Failed with constraints:', constraints, err)
          
          // If we have a stream from a previous attempt, stop its tracks
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop())
            mediaStream = null
          }
        }
      }
      
      // If we still don't have a stream, try one last time with device-specific constraints
      if (!mediaStream && availableDevices.length > 0) {
        try {
          const videoDevices = availableDevices.filter(d => d.kind === 'videoinput')
          const audioDevices = availableDevices.filter(d => d.kind === 'audioinput')
          
          const deviceConstraints: MediaStreamConstraints = {
            video: videoDevices.length > 0 ? {
              deviceId: videoDevices[0].deviceId ? { exact: videoDevices[0].deviceId } : undefined
            } : false,
            audio: audioDevices.length > 0
          }
          
          console.log('Trying device-specific constraints:', deviceConstraints)
          mediaStream = await navigator.mediaDevices.getUserMedia(deviceConstraints)
          console.log('✅ Got media stream with device-specific constraints')
        } catch (deviceError) {
          console.error('Device-specific constraints failed:', deviceError)
          lastError = deviceError as Error
        }
      }
      
      // If we still don't have a stream, throw the last error
      if (!mediaStream) {
        throw lastError || new Error('Failed to access camera/microphone. Please check your device permissions.')
      }
      
      if (!mediaStream) {
        throw new Error('Failed to get media stream')
      }
      
      // Store the stream for later use
      setLocalStream(mediaStream)
      
      // Get the video element
      const localVideoElement = document.getElementById("local-video") as HTMLVideoElement
      
      if (localVideoElement) {
        console.log('Setting up local video...')
        
        // Set video element properties
        localVideoElement.srcObject = mediaStream
        localVideoElement.muted = true
        localVideoElement.playsInline = true
        localVideoElement.autoplay = true
        
        // Try to play the video with error handling
        try {
          await localVideoElement.play()
          console.log('✅ Video play successful')
          setNeedsUserInteraction(false)
        } catch (playError) {
          console.warn('Autoplay blocked, will need user interaction:', playError)
          setNeedsUserInteraction(true)
          
          // Show a play button overlay
          const playOverlay = document.createElement('div')
          playOverlay.style.position = 'absolute'
          playOverlay.style.top = '0'
          playOverlay.style.left = '0'
          playOverlay.style.right = '0'
          playOverlay.style.bottom = '0'
          playOverlay.style.display = 'flex'
          playOverlay.style.alignItems = 'center'
          playOverlay.style.justifyContent = 'center'
          playOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)'
          playOverlay.style.zIndex = '10'
          
          const playButton = document.createElement('button')
          playButton.textContent = '▶️ Start Video'
          playButton.style.padding = '10px 20px'
          playButton.style.backgroundColor = '#3b82f6'
          playButton.style.color = 'white'
          playButton.style.border = 'none'
          playOverlay.style.borderRadius = '4px'
          playButton.style.cursor = 'pointer'
          playButton.style.fontSize = '16px'
          
          playButton.onclick = async () => {
            try {
              await localVideoElement.play()
              playOverlay.remove()
              setNeedsUserInteraction(false)
            } catch (err) {
              console.error('Failed to play after interaction:', err)
              toast({
                title: 'Error',
                description: 'Failed to start video. Please check your camera settings.',
                variant: 'destructive'
              })
            }
          }
          
          playOverlay.appendChild(playButton)
          localVideoElement.parentElement?.appendChild(playOverlay)
        }
      }
      
      // Initialize ZegoCloud
      try {
        const config = await generateZegoToken()
        const appId = parseInt(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID || "326425291")
        
        await zegoService.current.initialize(appId)
        await zegoService.current.joinRoom(config)
        console.log('✅ ZegoCloud initialized and joined room')
        
        // Try to play local video through ZegoCloud if needed
        try {
          await zegoService.current.playLocalVideo("local-video")
          console.log('✅ ZegoCloud local video started')
        } catch (zegoError) {
          console.warn('ZegoCloud local video failed, but direct stream should work:', zegoError)
        }
      } catch (zegoError) {
        console.error('ZegoCloud initialization failed:', zegoError)
        // Continue with local stream even if ZegoCloud fails
        toast({
          title: 'Warning',
          description: 'Video call features may be limited. Camera should still work.',
          variant: 'default'
        })
      }

      setIsJoined(true)
      callStartTime.current = new Date()

      await fetch(`/api/video-calls/${callId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      })

      toast({
        title: "Joined Call",
        description: "You have successfully joined the video call with enhanced device support",
      })
    } catch (error: any) {
      console.error("Failed to join call:", error)
      
      // Enhanced error messages for device issues
      let errorMessage = "Failed to join the video call"
      
      if (error.name === 'NotReadableError' || (error.message && typeof error.message === 'string' && error.message.includes('device in use'))) {
        errorMessage = "Camera/microphone is being used by another browser or application. Each browser needs independent device access."
      } else if (error.name === 'NotAllowedError') {
        errorMessage = "Camera/microphone access denied. Please allow permissions and refresh the page."
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera/microphone found. Please connect a device and refresh the page."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const forcePlayVideo = async () => {
    const localVideoElement = document.getElementById("local-video") as HTMLVideoElement
    
    if (!localVideoElement || !localStream) {
      toast({
        title: "Error",
        description: "Video stream not available. Please try rejoining the call.",
        variant: "destructive"
      })
      return
    }
    
    try {
      // Reassign stream with a small delay to ensure proper initialization
      localVideoElement.srcObject = localStream
      localVideoElement.muted = true
      localVideoElement.playsInline = true
      
      // Add a small delay to allow the browser to process the stream
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Try to play the video
      await localVideoElement.play()
      
      console.log('✅ Video started after user interaction')
      setNeedsUserInteraction(false)
      
      toast({
        title: "Success",
        description: "Camera is now active",
      })
      
      // Remove any existing play button overlays
      const existingOverlays = document.querySelectorAll('[data-video-overlay]')
      existingOverlays.forEach(el => el.remove())
      
    } catch (err) {
      console.error('Failed to play video:', err)
      
      // Show a more specific error message
      let errorMessage = 'Failed to start video playback'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permission denied. Please allow camera access.'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please check your device.'
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.'
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }
      
      toast({
        title: "Video Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      })
    }
  }

  const leaveCall = async () => {
    try {
      await zegoService.current.leave()
      
      // Don't stop tracks to allow other tabs to continue
      if (localStream) {
        console.log('Disconnecting from stream (keeping tracks active for other tabs)')
        setLocalStream(null)
      }
      
      setIsJoined(false)
      callStartTime.current = null
      setNeedsUserInteraction(false)

      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }

      await fetch(`/api/video-calls/${callId}`, {
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
      const enabled = await zegoService.current.toggleMicrophone()
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
      const enabled = await zegoService.current.toggleCamera()
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
        await zegoService.current.stopScreenShare()
        setIsScreenSharing(false)
        toast({
          title: "Screen Share Stopped",
          description: "You have stopped sharing your screen",
        })
      } else {
        await zegoService.current.startScreenShare()
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
      const users = zegoService.current.getRemoteUsers()
      setRemoteUsers(users.map(id => parseInt(id)))
    }

    const interval = setInterval(updateRemoteUsers, 1000)

    return () => clearInterval(interval)
  }, [isJoined])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Video Call</h1>
            <p className="text-gray-400">Room: {roomName}</p>
          </div>
          <div className="flex items-center gap-4">
            {isJoined && (
              <Badge variant="secondary" className="bg-green-600">
                <Users className="w-4 h-4 mr-1" />
                {remoteUsers.length + 1} participants
              </Badge>
            )}
            {isJoined && (
              <Badge variant="outline">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Local Video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  id="local-video"
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary">You</Badge>
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {needsUserInteraction && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <Button onClick={forcePlayVideo} variant="secondary" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Video
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {remoteUsers.length > 0 ? (
                  <video
                    id={`remote-video-${remoteUsers[0]}`}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Waiting for participant...</p>
                    </div>
                  </div>
                )}
                {remoteUsers.length > 0 && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary">Remote User</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {!isJoined ? (
                  <Button
                    onClick={joinCall}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Joining..." : "Join Call"}
                  </Button>
                ) : (
                  <>
                    {/* Microphone Toggle */}
                    <Button
                      variant={isAudioEnabled ? "secondary" : "destructive"}
                      size="icon"
                      onClick={toggleMicrophone}
                    >
                      {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>

                    {/* Camera Toggle */}
                    <Button
                      variant={isVideoEnabled ? "secondary" : "destructive"}
                      size="icon"
                      onClick={toggleCamera}
                    >
                      {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </Button>

                    {/* Screen Share Toggle */}
                    <Button
                      variant={isScreenSharing ? "destructive" : "secondary"}
                      size="icon"
                      onClick={toggleScreenShare}
                    >
                      {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                    </Button>

                    {/* Leave Call */}
                    <Button
                      variant="destructive"
                      onClick={leaveCall}
                      className="ml-4"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      Leave Call
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
