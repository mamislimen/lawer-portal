'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import VideoCallRoom from '@/components/video-call-room';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function VideoCallRoomPage({ params }: { params: { roomId: string } }) {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const user = session?.user as User | undefined;
  const isLoading = status === 'loading';
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const roomId = params.roomId;
  const role = searchParams.get('role');
  const isLawyer = role === 'lawyer';

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (isLoading || !isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-6 text-gray-600">
            Please sign in to join the video call.
          </p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <VideoCallRoom 
        callId={roomId}
        roomName={roomId}
        isHost={isLawyer}
      />
    </div>
  );
}
