'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Phone, Calendar } from 'lucide-react';
import VideoCallRoom from '@/components/video-call-room';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type VideoCall = {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  participantId: string;
  caseId: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  roomName: string;
  participant: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export default function VideoCallsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchCalls();
    }
  }, [status, router]);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      // In a real app, fetch calls from your API
      // const res = await fetch('/api/video-calls');
      // const data = await res.json();
      // setCalls(data);
    } catch (error) {
      console.error('Error fetching calls:', error);
      toast.error('Failed to load video calls');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting a new call
  const handleStartCall = () => {
    router.push('/dashboard/video-calls/start');
  };

  // Handle leaving the call
  const handleLeaveCall = () => {
    setActiveCall(null);
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If there's an active call, show the call interface
  if (activeCall) {
    return (
      <VideoCallRoom
        callId={activeCall.id}
        roomName={activeCall.roomName}
        isHost={activeCall.hostId === session?.user?.id}
      />
    );
  }

  // Main video calls page
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Video Calls</h1>
          <p className="text-muted-foreground">Manage your video call sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleStartCall}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Phone className="mr-2 h-4 w-4" />
            Start New Call
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Call
          </Button>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-muted-foreground text-center py-8">
              No recent calls. Start a new call to begin.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
