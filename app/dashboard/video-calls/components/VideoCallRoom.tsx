"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import AgoraRTC, { 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID,
  ILocalTrack,
  ILocalVideoTrack,
  ILocalAudioTrack
} from "agora-rtc-sdk-ng"
import { useAgoraContext } from "@/contexts/AgoraContext"
import { VideoPlayer } from "./VideoPlayer"
import { VideoCallControls } from "./VideoCallControls"

interface VideoCallRoomProps {
  channelName: string
  userId: string | number
  onLeave: () => void
  onEndCall: () => void
}

export function VideoCallRoom({ channelName, userId, onLeave, onEndCall }: VideoCallRoomProps) {
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [start, setStart] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const screenTrackRef = useRef<ICameraVideoTrack | null>(null)

  const { client, tracks, ready } = useAgoraContext()

  useEffect(() => {
    if (!ready || !tracks || !client) return

    const init = async () => {
      // Handle user published event
      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        if (!client) return;
        await client.subscribe(user, mediaType)
        
        if (mediaType === 'video') {
          setUsers(prevUsers => {
            if (!prevUsers.some(u => u.uid === user.uid)) {
              return [...prevUsers, user]
            }
            return prevUsers
          })
        }
        
        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play()
        }
      }

      // Handle user unpublished event
      const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        if (mediaType === 'audio') {
          user.audioTrack?.stop()
        }
        if (mediaType === 'video') {
          setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid))
        }
      }

      // Handle user left event
      const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
        setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid))
      }

      // Set up event listeners
      client.on('user-published', handleUserPublished)
      client.on('user-unpublished', handleUserUnpublished)
      client.on('user-left', handleUserLeft)

      try {
        // Join the channel
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          null,
          userId
        )

        // Publish local tracks
        if (tracks) {
          await client.publish(tracks as unknown as ILocalTrack[])
          setStart(true)
        }
      } catch (error) {
        console.error('Error joining the call:', error)
      }

      // Cleanup function
      return () => {
        client.off('user-published', handleUserPublished)
        client.off('user-unpublished', handleUserUnpublished)
        client.off('user-left', handleUserLeft)
      }
    }

    init()

    return () => {
      // Cleanup tracks when component unmounts
      if (tracks) {
        tracks[0]?.stop()
        tracks[0]?.close()
        tracks[1]?.stop()
        tracks[1]?.close()
      }
      
      if (screenTrackRef.current) {
        screenTrackRef.current.stop()
        screenTrackRef.current.close()
        screenTrackRef.current = null
      }
      
      client.leave()
    }
  }, [channelName, client, ready, tracks, userId])

  const toggleMic = () => {
    if (tracks && tracks[0]) {
      setIsMuted((prev) => {
        tracks[0]!.setMuted(!prev)
        return !prev
      })
    }
  }

  const toggleCamera = () => {
    if (tracks && tracks[1]) {
      setIsVideoOff((prev) => {
        tracks[1]!.setEnabled(prev)
        return !prev
      })
    }
  }

  const toggleScreenShare = async () => {
    if (!tracks || !client) return

    if (!isScreenSharing) {
      try {
        // Create screen sharing track
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
        }, 'enable')
        
        // Unpublish camera track and publish screen track
        if (tracks[1]) {
          await client.unpublish(tracks[1] as unknown as ILocalTrack)
        }
        await client.publish(screenTrack as unknown as ILocalTrack)
        
        // Store screen track reference
        screenTrackRef.current = screenTrack as unknown as ICameraVideoTrack
        setIsScreenSharing(true)
      } catch (error) {
        console.error('Failed to share screen:', error)
      }
    } else {
      // Stop screen sharing
      if (screenTrackRef.current) {
        await client.unpublish(screenTrackRef.current as unknown as ILocalTrack)
        screenTrackRef.current.stop()
        screenTrackRef.current.close()
        screenTrackRef.current = null
      }
      
      // Publish camera track again if available
      if (tracks[1]) {
        await client.publish(tracks[1] as unknown as ILocalTrack)
      }
      setIsScreenSharing(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local Video */}
        <div className="bg-black rounded-lg overflow-hidden relative">
          <VideoPlayer
            videoTrack={isScreenSharing ? screenTrackRef.current : tracks?.[1]}
            audioTrack={tracks?.[0]}
            isMuted={true}
            isVideoOff={isVideoOff}
            isLocal={true}
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            You ({userId})
          </div>
        </div>

        {/* Remote Videos */}
        {users.map((user) => (
          <div key={user.uid} className="bg-black rounded-lg overflow-hidden relative">
            <VideoPlayer
              videoTrack={user.videoTrack}
              audioTrack={user.audioTrack}
              isMuted={false}
              isVideoOff={!user.videoTrack}
              uid={user.uid}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
              User {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <VideoCallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onLeaveCall={onLeave}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  )
}
