"use client"

import { useEffect, useRef } from "react"
import { 
  IMicrophoneAudioTrack, 
  ICameraVideoTrack, 
  IRemoteVideoTrack, 
  IRemoteAudioTrack 
} from "agora-rtc-sdk-ng"

type VideoPlayerProps = {
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null
  audioTrack?: IMicrophoneAudioTrack | IRemoteAudioTrack | null
  isMuted: boolean
  isVideoOff: boolean
  isLocal?: boolean
  uid?: number | string
}

export function VideoPlayer({
  videoTrack,
  audioTrack,
  isMuted,
  isVideoOff,
  isLocal = false,
  uid,
}: VideoPlayerProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    
    let videoCleanup: (() => void) | undefined;
    
    // Handle video track
    if (videoTrack && !isVideoOff) {
      videoTrack.play(container.current, { fit: "cover" })
      
      // Create cleanup function for video
      videoCleanup = () => {
        if (videoTrack) {
          videoTrack.stop()
          if ('close' in videoTrack) {
            videoTrack.close()
          }
        }
      }
    }
    
    // Handle audio track
    if (audioTrack && !isMuted) {
      audioTrack.play()
    }
    
    return () => {
      // Clean up video
      if (videoCleanup) {
        videoCleanup()
      }
      
      // Clean up audio
      if (audioTrack) {
        audioTrack.stop()
        if ('close' in audioTrack) {
          audioTrack.close()
        }
      }
    }
  }, [videoTrack, audioTrack, isMuted, isVideoOff])

  useEffect(() => {
    // Handle audio track
    if (audioTrack) {
      if (isMuted) {
        audioTrack.setVolume(0)
      } else {
        audioTrack.setVolume(1)
      }
    }
  }, [audioTrack, isMuted])

  return (
    <div 
      ref={container}
      className={`w-full h-full ${isVideoOff ? 'bg-gray-800 flex items-center justify-center' : ''}`}
    >
      {isVideoOff && (
        <div className="text-white text-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl">{uid?.toString().charAt(0) || 'U'}</span>
          </div>
          <p>{isLocal ? 'You' : `User ${uid}`}</p>
        </div>
      )}
    </div>
  )
}
