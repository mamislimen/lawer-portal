'use client';

import { useState, useRef, useEffect } from 'react';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

// Replace these with your ZEGOCLOUD credentials
export default function ZegoCloudCall() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const zgRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const streamID = 'test-stream' + Math.floor(Math.random() * 10000);
  
  // ZEGOCLOUD configuration
  const appID = 326425291; // Your App ID
  const server = 'wss://webliveroom-test.zego.im/ws'; // Test server
  
  // Initialize ZEGO client
  const initZego = () => {
    const zg = new ZegoExpressEngine(appID, server);
    zgRef.current = zg;
    
    // Handle remote stream updates
    zg.on('roomStreamUpdate', (roomID: string, updateType: 'ADD' | 'DELETE', streamList: any[]) => {
      if (updateType === 'ADD') {
        playRemoteStream(streamList[0].streamID);
      } else if (updateType === 'DELETE') {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    });
    
    return zg;
  };
  
  // Start local video preview
  const startPreview = async () => {
    try {
      const zg = zgRef.current || initZego();
      const stream = await zg.createStream({
        camera: { audio: true, video: true }
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error starting preview:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
      throw err;
    }
  };
  
  // Play remote stream
  const playRemoteStream = async (streamID: string) => {
    try {
      const zg = zgRef.current;
      const stream = await zg.startPlayingStream(streamID);
      setRemoteStream(stream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error playing remote stream:', err);
    }
  };
  
  // Join room and start call
  const joinCall = async () => {
    if (isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const zg = zgRef.current || initZego();
      
      // Login to ZEGOCLOUD without token for testing
      const userID = 'user' + Math.floor(Math.random() * 10000);
      const userName = 'User' + Math.floor(Math.random() * 1000);
      
      await zg.loginRoom('test-room', '', { userID, userName });
      
      // Create stream directly with ZegoCloud
      const stream = await zg.createStream({
        camera: { audio: true, video: true }
      });
      
      // Set stream to video element immediately
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play();
      }
      
      // Publish stream
      await zg.startPublishingStream(streamID, stream);
      
      setIsConnected(true);
    } catch (err) {
      console.error('Error joining call:', err);
      setError('Failed to join call. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Leave call and clean up
  const leaveCall = async () => {
    try {
      const zg = zgRef.current;
      if (zg) {
        await zg.stopPublishingStream(streamID);
        await zg.logoutRoom('test-room');
        
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
          localStreamRef.current = null;
        }
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        
        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);
      }
    } catch (err) {
      console.error('Error leaving call:', err);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (zgRef.current) {
        leaveCall();
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ZEGOCLOUD Video Call</h1>
        
        {!isConnected ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Join Video Call</h2>
            
            <button
              type="button"
              onClick={joinCall}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting...' : 'Join Call'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-black rounded-md overflow-hidden">
                <div className="text-white p-2 bg-gray-800 text-sm">
                  You
                </div>
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-64 bg-gray-900"
                />
              </div>
              <div className="bg-black rounded-md overflow-hidden">
                <div className="text-white p-2 bg-gray-800 text-sm">
                  Remote
                </div>
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline
                  className="w-full h-64 bg-gray-900"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={leaveCall}
                className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700"
              >
                Leave Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
