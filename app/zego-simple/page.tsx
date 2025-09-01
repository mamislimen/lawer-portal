'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'

declare global {
  interface Window {
    ZegoExpressEngine: any;
  }
}

export default function ZegoSimplePage() {
  const [roomId, setRoomId] = useState('test-room-123')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'lawyer' | 'client'>('lawyer')
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const zegoRef = useRef<any>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Generate simple token (for testing only - not secure for production)
  const generateSimpleToken = () => {
    // This is a simplified approach - in production you should use proper JWT
    const appId = 326425291
    const timestamp = Math.floor(Date.now() / 1000)
    const randomString = Math.random().toString(36).substring(7)
    return `${appId}_${timestamp}_${randomString}`
  }

  const joinCall = async () => {
    if (!userId.trim() || !userName.trim()) {
      setError('Please enter both User ID and User Name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Load ZegoCloud SDK dynamically
      if (!window.ZegoExpressEngine) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/zego-express-engine-webrtc@2.25.0/index.js'
        document.head.appendChild(script)
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
      }

      const appID = 326425291
      const server = 'wss://webliveroom-api.zego.im/ws'
      
      // Initialize ZegoCloud
      const zg = new window.ZegoExpressEngine(appID, server)
      zegoRef.current = zg

      // Set up event listeners
      zg.on('roomStreamUpdate', (roomID: string, updateType: string, streamList: any[]) => {
        console.log('Stream update:', { roomID, updateType, streamList })
        
        if (updateType === 'ADD' && streamList.length > 0) {
          playRemoteStream(streamList[0].streamID)
        }
      })

      zg.on('roomStateUpdate', (roomID: string, state: string, errorCode: number) => {
        console.log('Room state:', { roomID, state, errorCode })
      })

      // Login to room without token (for testing)
      console.log('Joining room:', roomId)
      await zg.loginRoom(
        roomId,
        '', // Empty token for testing
        { userID: userId, userName: userName },
        { userUpdate: true }
      )

      // Create and publish local stream
      const stream = await zg.createStream({
        camera: { audio: true, video: true }
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const streamID = `${userId}_${Date.now()}`
      await zg.startPublishingStream(streamID, stream)

      setIsJoined(true)
      console.log('Successfully joined and published stream')

    } catch (err) {
      console.error('Error joining call:', err)
      setError(`Failed to join call: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const playRemoteStream = async (streamID: string) => {
    try {
      const zg = zegoRef.current
      if (zg) {
        const remoteStream = await zg.startPlayingStream(streamID)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      }
    } catch (err) {
      console.error('Error playing remote stream:', err)
    }
  }

  const leaveCall = async () => {
    try {
      const zg = zegoRef.current
      if (zg) {
        await zg.logoutRoom(roomId)
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }

      setIsJoined(false)
    } catch (err) {
      console.error('Error leaving call:', err)
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Simple Video Call Test</h1>

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Video Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={userRole === 'lawyer' ? 'default' : 'outline'}
                    onClick={() => setUserRole('lawyer')}
                    className="flex-1"
                  >
                    Lawyer
                  </Button>
                  <Button
                    variant={userRole === 'client' ? 'default' : 'outline'}
                    onClick={() => setUserRole('client')}
                    className="flex-1"
                  >
                    Client
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                />
              </div>
              
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={`Enter ${userRole} ID`}
                />
              </div>
              
              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={`Enter ${userRole} name`}
                />
              </div>

              <Button
                onClick={joinCall}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Joining...' : 'Join Call'}
              </Button>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                <p><strong>Instructions:</strong></p>
                <p>1. Both lawyer and client should use the same Room ID</p>
                <p>2. Use different User IDs (e.g., lawyer1, client1)</p>
                <p>3. Open this page in two browser tabs to test</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Local Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">You ({userName}) - {userRole}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {isVideoOff && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <VideoOff className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Remote Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Remote User</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-400">Waiting for remote user...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleMute}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant={isVideoOff ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={leaveCall}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Leave Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-600">
              <p>Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span></p>
              <p className="mt-2">Connected as {userRole}: {userName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
