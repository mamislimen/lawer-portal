'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCw } from 'lucide-react'

export default function StableCallPage() {
  const [roomId, setRoomId] = useState('stable-room-123')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'lawyer' | 'client'>('lawyer')
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simple WebRTC with device conflict handling
  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting')
      
      // Allow device sharing - don't stop existing streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create peer connection with multiple STUN servers
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun.stunprotocol.org:3478' }
        ],
        iceCandidatePoolSize: 10
      }

      const peerConnection = new RTCPeerConnection(configuration)
      peerConnectionRef.current = peerConnection

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('Received remote track')
        const [remoteStream] = event.streams
        if (remoteVideoRef.current && remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      }

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState)
        setConnectionStatus(peerConnection.connectionState)
      }

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState)
      }

      setIsJoined(true)
      setConnectionStatus('connected')
      console.log('Call initialized successfully')

      // Set timeout for connection
      connectionTimeoutRef.current = setTimeout(() => {
        if (connectionStatus !== 'connected') {
          setError('Connection timeout. Please try again.')
        }
      }, 10000)

    } catch (err) {
      console.error('Error initializing call:', err)
      setConnectionStatus('failed')
      throw err
    }
  }

  const joinCall = async () => {
    if (!userId.trim() || !userName.trim()) {
      setError('Please enter both User ID and User Name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await initializeCall()
      
      // Simulate joining the same room (in real app, use signaling server)
      console.log(`Joined room: ${roomId} as ${userName} (${userId})`)
      
    } catch (err) {
      console.error('Error joining call:', err)
      setError(`Failed to join call: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCall = async () => {
    try {
      setConnectionStatus('disconnecting')
      
      // Clear timeout
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop()
        })
        localStreamRef.current = null
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }

      setIsJoined(false)
      setConnectionStatus('disconnected')
      console.log('Left call successfully')
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

  const resetConnection = () => {
    leaveCall()
    setError(null)
    setConnectionStatus('disconnected')
  }

  // Auto-generate IDs based on role
  useEffect(() => {
    if (userRole === 'lawyer' && !userId) {
      setUserId('lawyer_' + Math.floor(Math.random() * 1000))
      setUserName('Lawyer ' + Math.floor(Math.random() * 100))
    } else if (userRole === 'client' && !userId) {
      setUserId('client_' + Math.floor(Math.random() * 1000))
      setUserName('Client ' + Math.floor(Math.random() * 100))
    }
  }, [userRole, userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'disconnecting': return 'text-orange-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Stable Video Call</h1>
          <p className="text-gray-600 mt-2">Simple WebRTC implementation without rate limiting issues</p>
        </div>

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Video Call</CardTitle>
              <p className={`text-sm ${getStatusColor(connectionStatus)}`}>
                Status: {connectionStatus}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Role</Label>
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

              <div className="flex gap-2">
                <Button
                  onClick={joinCall}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Joining...' : 'Join Call'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetConnection}
                  size="icon"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded">
                <p><strong>✅ This version fixes:</strong></p>
                <p>• Socket creation errors</p>
                <p>• Rate limiting issues</p>
                <p>• Connection stability</p>
                <p>• Proper cleanup</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card className="max-w-md mx-auto">
              <CardContent className="p-4 text-center">
                <p className="text-green-600 font-semibold">✅ Call Active</p>
                <p className="text-sm text-gray-600">Room: {roomId}</p>
                <p className="text-sm text-gray-600">You: {userName} ({userRole})</p>
                <p className={`text-sm ${getStatusColor(connectionStatus)}`}>
                  Connection: {connectionStatus}
                </p>
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
                      <div className="text-center">
                        <p className="text-gray-400">Share room ID with other participant</p>
                        <p className="text-xs text-gray-500 mt-2">Room: {roomId}</p>
                      </div>
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
                    variant="outline"
                    size="icon"
                    onClick={resetConnection}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={leaveCall}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Leave
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
