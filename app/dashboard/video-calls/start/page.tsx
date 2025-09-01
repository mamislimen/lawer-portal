'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function StartVideoCallPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isStarting, setIsStarting] = useState(false);
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const handleStartCall = async () => {
    if (!user?.id) return;
    
    try {
      setIsStarting(true);
      // Generate a unique room ID (you might want to use UUID in production)
      const roomId = `lawyer-${user.id}-${Date.now()}`;
      
      // Redirect to the video call room
      router.push(`/dashboard/video-calls/room/${roomId}?role=lawyer`);
    } catch (error) {
      console.error('Failed to start call:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Start a Video Call</h1>
          <p className="text-gray-600">
            Create a new video call room and invite clients to join you.
          </p>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={handleStartCall}
            className="w-full"
            disabled={isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Room...
              </>
            ) : (
              'Start Video Call'
            )}
          </Button>
        </div>
        
        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>Click "Start Video Call" to create a new room</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>Share the room link with your client</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>Wait for your client to join the call</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
