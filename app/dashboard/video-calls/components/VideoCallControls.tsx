"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, Phone } from "lucide-react"

type VideoCallControlsProps = {
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  onToggleMic: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onLeaveCall: () => void
  onEndCall: () => void
}

export function VideoCallControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onLeaveCall,
  onEndCall,
}: VideoCallControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <Button
        variant={isMuted ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleMic}
        className="rounded-full w-12 h-12"
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        variant={isVideoOff ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleCamera}
        className="rounded-full w-12 h-12"
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </Button>

      <Button
        variant={isScreenSharing ? "default" : "outline"}
        size="icon"
        onClick={onToggleScreenShare}
        className="rounded-full w-12 h-12"
      >
        <ScreenShare className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onLeaveCall}
        className="rounded-full w-12 h-12"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>

      <Button
        variant="destructive"
        size="icon"
        onClick={onEndCall}
        className="rounded-full w-12 h-12"
      >
        <Phone className="h-5 w-5" />
      </Button>
    </div>
  )
}
