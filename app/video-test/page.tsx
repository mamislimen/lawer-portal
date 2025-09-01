'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'

export default function VideoTestPage() {
  const [roomId, setRoomId] = useState('lawyer-client-room')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'lawyer' | 'client'>('lawyer')
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remoteUsers, setRemoteUsers] = useState<string[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const zegoRef = useRef<any>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Load ZegoCloud SDK
  useEffect(() => {
    const loadZegoSDK = async () => {
      if (typeof window !== 'undefined' && !window.ZegoExpressEngine) {
        try {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/zego-express-engine-webrtc@2.25.0/index.js'
          script.async = true
          document.head.appendChild(script)
          
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        } catch (err) {
          console.error('Failed to load ZegoCloud SDK:', err)
        }
      }
    }
    
    loadZegoSDK()
  }, [])

  const joinCall = async () => {
    if (!userId.trim() || !userName.trim()) {
      setError('Please enter both User ID and User Name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if SDK is loaded
      if (!window.ZegoExpressEngine) {
        throw new Error('ZegoCloud SDK not loaded')
      }

      const appID = 326425291
      
      // Initialize ZegoCloud with default server
      const zg = new window.ZegoExpressEngine(appID, 'wss://webliveroom-api.zego.im/ws')
      zegoRef.current = zg

      // Set up event listeners
      zg.on('roomStreamUpdate', (roomID: string, updateType: string, streamList: any[]) => {
        console.log('Stream update:', { roomID, updateType, streamList })
        
        if (updateType === 'ADD' && streamList.length > 0) {
          streamList.forEach(stream => {
            playRemoteStream(stream.streamID)
          })
        } else if (updateType === 'DELETE') {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null
          }
        }
      })

      zg.on('roomUserUpdate', (roomID: string, updateType: string, userList: any[]) => {
        console.log('User update:', { roomID, updateType, userList })
        if (updateType === 'ADD') {
          setRemoteUsers(prev => [...prev, ...userList.map(u => u.userID)])
        } else if (updateType === 'DELETE') {
          setRemoteUsers(prev => prev.filter(id => !userList.some(u => u.userID === id)))
        }
      })

      zg.on('roomStateUpdate', (roomID: string, state: string, errorCode: number) => {
        console.log('Room state:', { roomID, state, errorCode })
        if (errorCode !== 0) {
          setError(`Room connection error: ${errorCode}`)
        }
      })

      // Join room without token (for testing)
      console.log('Joining room:', roomId, 'as:', userId)
      await zg.loginRoom(
        roomId,
        '', // No token for testing
        { userID: userId, userName: userName }
      )

      // Get user media and create stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Publish stream to ZegoCloud
      const streamID = `${userId}_${Date.now()}`
      await zg.startPublishingStream(streamID, stream)

      setIsJoined(true)
      console.log('Successfully joined room and published stream')

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
        console.log('Playing remote stream:', streamID)
      }
    } catch (err) {
      console.error('Error playing remote stream:', err)
    }
  }

  const leaveCall = async () => {
    try {
      const zg = zegoRef.current
      if (zg) {
        await zg.logoutRoom()
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
      setRemoteUsers([])
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
        <h1 className="text-3xl font-bold text-center mb-8">Video Call Test - Simple</h1>

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Video Call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Role</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={userRole === 'lawyer' ? 'default' : 'outline'}
                    onClick={() => {
                      setUserRole('lawyer')
                      setUserId('lawyer_' + Math.floor(Math.random() * 1000))
                      setUserName('Lawyer ' + Math.floor(Math.random() * 100))
                    }}
                    className="flex-1"
                  >
                    Lawyer
                  </Button>
                  <Button
                    variant={userRole === 'client' ? 'default' : 'outline'}
                    onClick={() => {
                      setUserRole('client')
                      setUserId('client_' + Math.floor(Math.random() * 1000))
                      setUserName('Client ' + Math.floor(Math.random() * 100))
                    }}
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
                  placeholder="Auto-generated"
                />
              </div>
              
              <div>
                <Label htmlFor="userName">User Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Auto-generated"
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

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Test Instructions:</strong></p>
                <p>1. Use the same Room ID for both lawyer and client</p>
                <p>2. Open this page in two browser tabs</p>
                <p>3. Select different roles and join</p>
                <p>4. Both should see each other's video</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4 text-center">
                <p className="text-green-600 font-semibold">✅ Connected to Room</p>
                <p className="text-sm text-gray-600">Room: {roomId}</p>
                <p className="text-sm text-gray-600">You: {userName} ({userRole})</p>
                <p className="text-sm text-gray-600">Remote users: {remoteUsers.length}</p>
              </CardContent>
            </Card>

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
                  <CardTitle className="text-sm">
                    Remote User {remoteUsers.length > 0 ? `(${remoteUsers.length} connected)` : '(waiting...)'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {remoteUsers.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400">Waiting for other participant...</p>
                      </div>
                    )}
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
          </div>
        )}
      </div>
    </div>
  )
}
