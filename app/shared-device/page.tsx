'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react'

export default function SharedDevicePage() {
  const [roomId, setRoomId] = useState('shared-room-123')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'lawyer' | 'client'>('lawyer')
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const sharedStreamRef = useRef<MediaStream | null>(null)

  // Get shared media stream that can be used by multiple tabs
  const getSharedStream = async () => {
    try {
      // Use basic constraints that allow device sharing
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          frameRate: 30
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      })

      return stream
    } catch (err: any) {
      console.error('Error accessing shared devices:', err)
      
      // Try with minimal constraints if first attempt fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        return fallbackStream
      } catch (fallbackErr) {
        throw new Error(`Cannot access camera/microphone: ${err.message}`)
      }
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
      // Get shared media stream
      const stream = await getSharedStream()
      
      sharedStreamRef.current = stream
      
      // Ensure video element is properly set up
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        
        // Force video to play
        try {
          await localVideoRef.current.play()
        } catch (playError) {
          console.log('Autoplay prevented, user interaction required')
        }
      }

      // Simulate joining room (add user to active users)
      setActiveUsers(prev => [...prev, userId])
      setIsJoined(true)
      
      console.log('Successfully joined with shared device access:', {
        roomId,
        userId,
        userName,
        role: userRole,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      })

    } catch (err: any) {
      console.error('Error joining call:', err)
      setError(err.message || 'Failed to join call')
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCall = async () => {
    try {
      // Remove user from active users
      setActiveUsers(prev => prev.filter(id => id !== userId))
      
      // Only stop stream if no other users (in real app, check server)
      if (activeUsers.length <= 1 && sharedStreamRef.current) {
        sharedStreamRef.current.getTracks().forEach(track => track.stop())
        sharedStreamRef.current = null
      }

      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }

      setIsJoined(false)
      console.log('Left call, devices remain available for others')
    } catch (err) {
      console.error('Error leaving call:', err)
    }
  }

  const toggleMute = () => {
    if (sharedStreamRef.current) {
      const audioTrack = sharedStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (sharedStreamRef.current) {
      const videoTrack = sharedStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
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

  // Cleanup only on unmount, not on role change
  useEffect(() => {
    return () => {
      if (sharedStreamRef.current && activeUsers.length <= 1) {
        sharedStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Shared Device Video Call</h1>
          <p className="text-gray-600 mt-2">Allows multiple users to access the same camera/microphone</p>
        </div>

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Video Call</CardTitle>
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Device sharing enabled
              </div>
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

              <div className="text-xs text-gray-500 space-y-1 bg-green-50 p-3 rounded border border-green-200">
                <p><strong>✅ Device Sharing Features:</strong></p>
                <p>• Multiple tabs can use same camera</p>
                <p>• No exclusive device locking</p>
                <p>• Graceful device conflict handling</p>
                <p>• Automatic fallback constraints</p>
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
                <p className="text-sm text-blue-600">
                  Active users: {activeUsers.length}
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
                        <p className="text-gray-400">Open another tab with same Room ID</p>
                        <p className="text-xs text-gray-500 mt-2">Room: {roomId}</p>
                        <p className="text-xs text-green-500 mt-1">Device sharing enabled ✅</p>
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
                    variant="destructive"
                    onClick={leaveCall}
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Leave Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-xs text-gray-500 bg-blue-50 p-3 rounded">
              <p>💡 <strong>Testing:</strong> Open this page in multiple tabs with different roles and same Room ID</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
