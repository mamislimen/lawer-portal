"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Users, Video, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VideoCallWaitingRoomProps {
  channelName: string;
  onJoinCall: () => void;
  onCancel: () => void;
}

export function VideoCallWaitingRoom({
  channelName,
  onJoinCall,
  onCancel,
}: VideoCallWaitingRoomProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [participants, setParticipants] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Simulate checking for other participants
  useEffect(() => {
    const checkParticipants = async () => {
      try {
        // In a real app, you would check the actual number of participants in the channel
        // For now, we'll simulate this with a timeout
        const timer = setTimeout(() => {
          setParticipants(1); // Simulate that you're the only one in the waiting room
        }, 2000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Error checking participants:", err);
        setError("Failed to check for other participants");
      }
    };

    checkParticipants();
  }, [channelName]);

  const handleJoinCall = async () => {
    try {
      setIsJoining(true);
      await onJoinCall();
    } catch (err) {
      console.error("Error joining call:", err);
      setError("Failed to join the call. Please try again.");
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 rounded-lg">
      <div className="text-center max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
          <Video className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Waiting for the call to start...
        </h2>
        
        <p className="text-gray-600 mb-6">
          {participants > 0 
            ? `You'll be connected as soon as the other participant joins.`
            : "Preparing your video call..."
          }
        </p>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
          <Users className="h-4 w-4" />
          <span>{participants} participant{participants !== 1 ? 's' : ''} in waiting room</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleJoinCall}
            disabled={isJoining}
            className="w-full sm:w-auto"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Call Now"
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
            disabled={isJoining}
          >
            <PhoneOff className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
