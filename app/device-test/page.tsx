'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mic, MicOff, Video, VideoOff, PhoneOff, AlertTriangle } from 'lucide-react'

export default function DeviceTestPage() {
  const [roomId, setRoomId] = useState('device-safe-room')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'lawyer' | 'client'>('lawyer')
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceStatus, setDeviceStatus] = useState<'checking' | 'available' | 'in-use' | 'error'>('checking')
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Check device availability
  const checkDevices = async () => {
    try {
      setDeviceStatus('checking')
      
      // First, check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const audioDevices = devices.filter(device => device.kind === 'audioinput')
      
      setAvailableDevices(devices)
      
      if (videoDevices.length === 0 || audioDevices.length === 0) {
        setDeviceStatus('error')
        setError('Camera or microphone not found')
        return false
      }

      // Try to access devices with shared access constraints
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 },
            deviceId: { ideal: videoDevices[0]?.deviceId }
          },
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            deviceId: { ideal: audioDevices[0]?.deviceId }
          }
        })
        
        // Immediately stop the test stream
        testStream.getTracks().forEach(track => track.stop())
        setDeviceStatus('available')
        return true
        
      } catch (deviceError: any) {
        console.error('Device access error:', deviceError)
        
        if (deviceError.name === 'NotReadableError' || 
            deviceError.message.includes('device in use') ||
            deviceError.message.includes('Device in use')) {
          setDeviceStatus('in-use')
          setError('Camera/microphone is being used by another application. Please close other video apps and try again.')
        } else if (deviceError.name === 'NotAllowedError') {
          setDeviceStatus('error')
          setError('Camera/microphone access denied. Please allow permissions and refresh the page.')
        } else {
          setDeviceStatus('error')
          setError(`Device error: ${deviceError.message}`)
        }
        return false
      }
    } catch (err) {
      console.error('Error checking devices:', err)
      setDeviceStatus('error')
      setError('Failed to check device availability')
      return false
    }
  }

  // Allow device sharing - don't force release
  const releaseDevices = async () => {
    try {
      // Only clear video element, keep stream active for sharing
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null
      }
      
      console.log('Video element cleared, devices remain available for sharing')
    } catch (err) {
      console.error('Error clearing video:', err)
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
      // Don't release devices - allow sharing
      // Check device availability
      const devicesAvailable = await checkDevices()
      if (!devicesAvailable) {
        return
      }

      // Get user media with shared access - no exclusive constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsJoined(true)
      console.log('Successfully joined call with devices:', {
        video: stream.getVideoTracks().length,
        audio: stream.getAudioTracks().length
      })

    } catch (err: any) {
      console.error('Error joining call:', err)
      
      if (err.name === 'NotReadableError' || err.message.includes('Device in use')) {
        setError('Device is in use by another application. Please close other video apps (Teams, Zoom, etc.) and try again.')
      } else if (err.name === 'NotAllowedError') {
        setError('Camera/microphone access denied. Please allow permissions and refresh the page.')
      } else {
        setError(`Failed to join call: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCall = async () => {
    try {
      await releaseDevices()
      setIsJoined(false)
      setDeviceStatus('checking')
      console.log('Left call and released devices')
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

  // Auto-generate IDs and check devices on mount
  useEffect(() => {
    if (userRole === 'lawyer' && !userId) {
      setUserId('lawyer_' + Math.floor(Math.random() * 1000))
      setUserName('Lawyer ' + Math.floor(Math.random() * 100))
    } else if (userRole === 'client' && !userId) {
      setUserId('client_' + Math.floor(Math.random() * 1000))
      setUserName('Client ' + Math.floor(Math.random() * 100))
    }
    
    checkDevices()
  }, [userRole, userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseDevices()
    }
  }, [])

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'checking': return 'text-yellow-600'
      case 'in-use': return 'text-red-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅'
      case 'checking': return '🔄'
      case 'in-use': return '⚠️'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Device-Safe Video Call</h1>
          <p className="text-gray-600 mt-2">Handles device conflicts and "Device in use" errors</p>
        </div>

        {!isJoined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Video Call</CardTitle>
              <div className={`text-sm ${getDeviceStatusColor(deviceStatus)} flex items-center gap-2`}>
                <span>{getDeviceStatusIcon(deviceStatus)}</span>
                Device Status: {deviceStatus}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Device Status */}
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="text-xs space-y-1">
                    <p><strong>Available Devices:</strong></p>
                    <p>Video: {availableDevices.filter(d => d.kind === 'videoinput').length}</p>
                    <p>Audio: {availableDevices.filter(d => d.kind === 'audioinput').length}</p>
                  </div>
                </CardContent>
              </Card>

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
                  disabled={isLoading || deviceStatus !== 'available'}
                  className="flex-1"
                >
                  {isLoading ? 'Joining...' : 'Join Call'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={checkDevices}
                  size="icon"
                >
                  🔄
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Device Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {deviceStatus === 'in-use' && (
                <div className="text-xs text-gray-600 space-y-2 bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p><strong>🔧 Fix "Device in use" error:</strong></p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Close other video apps (Teams, Zoom, Skype)</li>
                    <li>Close other browser tabs using camera</li>
                    <li>Restart your browser</li>
                    <li>Check Windows camera privacy settings</li>
                    <li>Click refresh button above</li>
                  </ol>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded">
                <p><strong>💡 Tips:</strong></p>
                <p>• Use same Room ID for both participants</p>
                <p>• Open in two different browser windows</p>
                <p>• Ensure no other apps are using camera</p>
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
                <p className="text-xs text-gray-500 mt-2">
                  Video: {localStreamRef.current?.getVideoTracks().length || 0} | 
                  Audio: {localStreamRef.current?.getAudioTracks().length || 0}
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
                        <p className="text-gray-400">Share room ID: {roomId}</p>
                        <p className="text-xs text-gray-500 mt-2">Waiting for other participant...</p>
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
          </div>
        )}
      </div>
    </div>
  )
}
