"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarPlus, Calendar, Clock } from "lucide-react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor } from "lucide-react";
import { ScheduleCallDialog } from "./components/ScheduleCallDialog";
interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Case {
  id: string;
  title: string;
}

interface VideoCall {
  id: string;
  title: string;
  description: string | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  recordingUrl: string | null;
  agoraChannelName: string;
  host: User;
  participant: User | null;
  case: Case | null;
  isHost: boolean;
  meetingLink: string;
}

type CallStatus = "disconnected" | "connecting" | "connected" | "failed" | "ended" | "disconnecting";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || "";

export default function ClientVideoCallsPage() {
  const router = useRouter();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [recentAppointment, setRecentAppointment] = useState<any>(null);
  const { data: session, status } = useSession();

  // Video calls state
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Call state
  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<CallStatus>("disconnected");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Refs
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrack = useRef<ICameraVideoTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle when a new appointment is created
  const handleAppointmentCreated = async (newAppointment: any) => {
    try {
      // Refresh the video calls list to include the new appointment
      await fetchVideoCalls();
      toast({
        title: "Success",
        description: "Video call scheduled successfully!",
      });
    } catch (error) {
      console.error("Error handling new appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update video calls list",
        variant: "destructive"
      });
    }
  };

  // Fetch video calls from API
  const fetchVideoCalls = async () => {
    try {
      setLoading(true);
      // Fetch appointments of type 'MEETING' which we're using for video calls
      const response = await fetch("/api/appointments?type=MEETING");
      if (!response.ok) throw new Error("Failed to fetch video calls");
      
      const appointments = await response.json();
      
      // Transform appointments into VideoCall format
      const videoCallsData = appointments.map((appt: any) => ({
        id: appt.id,
        title: appt.title,
        description: appt.description,
        status: appt.status,
        scheduledAt: appt.startTime,
        startedAt: appt.startedAt || null,
        endedAt: appt.endedAt || null,
        duration: appt.duration || 30, // Default to 30 minutes if not specified
        recordingUrl: null, // Add this if you implement recording later
        agoraChannelName: `video-call-${appt.id}`, // Generate a channel name
        host: {
          id: appt.lawyer?.id || '',
          name: appt.lawyer?.name || 'Lawyer',
          email: appt.lawyer?.email || null,
          image: appt.lawyer?.image || null
        },
        participant: {
          id: appt.client?.id || '',
          name: appt.client?.name || 'Client',
          email: appt.client?.email || null,
          image: appt.client?.image || null
        },
        case: appt.case || null,
        isHost: session?.user?.id === appt.lawyerId,
        meetingLink: `/client/video-calls/${appt.id}`
      }));
      
      setVideoCalls(videoCallsData);
    } catch (err) {
      console.error("Error fetching video calls:", err);
      setError("Failed to load video calls.");
      toast({   
        title: "Error",
        description: "Failed to load video calls",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize Agora client
  const initAgoraClient = () => {
    if (typeof window !== 'undefined' && !clientRef.current) {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;
    }
    return clientRef.current;
  };

  // Join a video call
  const joinCall = async (call: VideoCall) => {
    try {
      setCurrentCall(call);
      setIsInCall(true);
      setConnectionStatus('connecting');
      
      if (!APP_ID) {
        const errorMsg = "Agora App ID is not configured. Please check your environment variables.";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Initialize Agora client
      const client = initAgoraClient();
      if (!client) {
        const errorMsg = "Failed to initialize Agora client. The browser may not be supported.";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // For testing purposes, you can use a simple channel name
      // In production, use the call.agoraChannelName
      const channelName = call.agoraChannelName || `test-channel-${Date.now()}`;
      const userId = session?.user?.id || `user-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Joining channel: ${channelName} with user: ${userId}`);
      
      // Join the channel with error handling for network issues
      try {
        await client.join(
          APP_ID,
          channelName,
          TOKEN || null, // Token is optional for testing
          userId
        );
        console.log("Successfully joined channel");
      } catch (joinError) {
        console.error("Failed to join channel:", joinError);
        throw new Error("Could not connect to the video call. Please check your internet connection and try again.");
      }
      
      // Create and publish local tracks with error handling
      let audioTrack: IMicrophoneAudioTrack | null = null;
      let videoTrack: ICameraVideoTrack | null = null;
      
      try {
        [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack().catch(err => {
            console.warn("Could not access microphone:", err);
            return null;
          }),
          AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
              frameRate: { max: 30 }
            }
          }).catch(err => {
            console.warn("Could not access camera:", err);
            return null;
          })
        ]);
        
        // Store track references if they exist
        if (audioTrack) {
          localAudioTrack.current = audioTrack;
        }
        if (videoTrack) {
          localVideoTrack.current = videoTrack;
        }
        
        // Publish tracks if they were created successfully
        const tracksToPublish = [];
        if (audioTrack) {
          tracksToPublish.push(audioTrack);
        }
        if (videoTrack) {
          tracksToPublish.push(videoTrack);
        }
        
        if (tracksToPublish.length > 0) {
          await client.publish(tracksToPublish);
        } else {
          console.warn("No tracks were published. Microphone and camera access might be denied.");
        }
        
        // Play local video if available
        if (videoTrack) {
          const localVideoElement = document.getElementById("local-video");
          if (localVideoElement) {
            videoTrack.play("local-video", { fit: "cover" });
          }
        }
        
        // Set up event listeners for remote users
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("user-left", handleUserLeft);
        
        // Start call timer
        callTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        setConnectionStatus("connected");
        toast({
        title: "Success",
        description: "Successfully joined the call!",
        variant: "default",
      });
        
      } catch (trackError) {
        console.error("Error setting up media tracks:", trackError);
        throw new Error("Could not access your camera or microphone. Please check your device permissions and try again.");
      }
      
    } catch (error) {
      console.error("Error joining call:", error);
      setConnectionStatus("failed");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join the call. Please try again.",
        variant: "destructive",
      });
      leaveCall();
    }
  };

  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
    await clientRef.current?.subscribe(user, mediaType);
    if (mediaType === "video" && remoteVideoRef.current) user.videoTrack?.play(remoteVideoRef.current);
    if (mediaType === "audio") user.audioTrack?.play();
  };

  const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {};
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {};

  const leaveCall = async () => {
    try {
      setConnectionStatus("disconnecting");
      
      // Stop all tracks and clean up resources
      const cleanupPromises = [];
      
      // Stop and clean up audio track
      if (clientRef.current?.localTracks.find((t) => t.trackMediaType === "audio")) {
        cleanupPromises.push(
          (async () => {
            try {
              clientRef.current?.localTracks.find((t) => t.trackMediaType === "audio")?.stop();
              clientRef.current?.localTracks.find((t) => t.trackMediaType === "audio")?.close();
            } catch (err) {
              console.error("Error cleaning up audio track:", err);
            }
          })()
        );
      }
      
      // Stop and clean up video track
      if (clientRef.current?.localTracks.find((t) => t.trackMediaType === "video")) {
        cleanupPromises.push(
          (async () => {
            try {
              clientRef.current?.localTracks.find((t) => t.trackMediaType === "video")?.stop();
              clientRef.current?.localTracks.find((t) => t.trackMediaType === "video")?.close();
            } catch (err) {
              console.error("Error cleaning up video track:", err);
            }
          })()
        );
      }
      
      // Stop and clean up screen share if active
      if (isScreenSharing) {
        cleanupPromises.push(
          (async () => {
            try {
              // Stop and clean up screen share
              // NOTE: You need to implement the screenTrack cleanup logic here
            } catch (err) {
              console.error("Error cleaning up screen share:", err);
            }
          })()
        );
      }
      
      // Leave the channel and clean up Agora client
      if (clientRef.current) {
        try {
          // Unpublish all tracks first
          try {
            await clientRef.current.unpublish();
          } catch (unpublishError) {
            console.warn("Error unpublishing tracks:", unpublishError);
          }
          
          // Leave the channel
          try {
            await clientRef.current.leave();
          } catch (leaveError) {
            console.warn("Error leaving channel:", leaveError);
          }
          
          // Remove all event listeners
          clientRef.current.removeAllListeners();
          clientRef.current = null;
        } catch (clientError) {
          console.error("Error cleaning up Agora client:", clientError);
        }
      }
      
      // Clear call timer
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      
      // Wait for all cleanup operations to complete
      await Promise.allSettled(cleanupPromises);
      
      // Reset state
      setConnectionStatus("disconnected");
      setIsInCall(false);
      setCurrentCall(null);
      setCallDuration(0);
      setIsMuted(false);
      setIsVideoOn(true);
      
      // Notify user
      toast({
        title: "Success",
        description: "You have left the call",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error during call cleanup:", error);
      toast({
        title: "Error",
        description: "Error leaving the call. Some resources may not have been cleaned up properly.",
        variant: "destructive",
      });
    } finally {
          // Ensure we always reset the connection status, even if there was an error
      setConnectionStatus("disconnected");
    }
  };

  const toggleMute = () => {
    const audioTrack = clientRef.current?.localTracks.find((t) => t.trackMediaType === "audio");
    if (audioTrack) {
      audioTrack.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    const videoTrack = clientRef.current?.localTracks.find((t) => t.trackMediaType === "video");
    if (videoTrack) {
      videoTrack.setMuted(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");
        await clientRef.current?.unpublish();
        await clientRef.current?.publish([screenTrack]);
        setIsScreenSharing(true);
      } else {
        await clientRef.current?.unpublish();
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        await clientRef.current?.publish([audioTrack, videoTrack]);
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to toggle screen share",
        variant: "destructive"
      });
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (status === "authenticated") fetchVideoCalls();
    return () => {
      leaveCall();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [status]);

  if (loading) return <Loader2 className="animate-spin" />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Calls</h1>
        <Button 
          onClick={() => setIsScheduleDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <CalendarPlus className="h-4 w-4" />
          Schedule Video Call
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="space-y-4">
          {videoCalls
            .filter(call => call.status === 'SCHEDULED' || call.status === 'IN_PROGRESS')
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .map((call) => (
              <Card key={call.id} className={`${call.status === 'IN_PROGRESS' ? 'border-2 border-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{call.title}</h3>
                      {call.description && (
                        <p className="text-sm text-gray-600 mt-1">{call.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{format(new Date(call.scheduledAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{format(new Date(call.scheduledAt), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center">
                          <span>•</span>
                          <span className="ml-2">{call.duration || 30} min</span>
                        </div>
                        {call.status === 'IN_PROGRESS' && (
                          <div className="flex items-center text-blue-600 font-medium">
                            <span className="flex h-2 w-2 mr-1.5 rounded-full bg-blue-600"></span>
                            In Progress
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => joinCall(call)}
                        disabled={connectionStatus === 'connecting' || connectionStatus === 'connected'}
                        className="whitespace-nowrap"
                      >
                        {connectionStatus === 'connecting' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {call.status === 'IN_PROGRESS' ? 'Join Call' : 'Start Call'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
          {videoCalls.filter(call => call.status === 'SCHEDULED' || call.status === 'IN_PROGRESS').length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No upcoming video calls</h3>
              <p className="mt-1 text-sm text-gray-500">Schedule a video call to get started.</p>
              <Button 
                onClick={() => setIsScheduleDialogOpen(true)}
                className="mt-4"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Video Call
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {videoCalls
            .filter(call => call.status === 'COMPLETED' || call.status === 'CANCELLED')
            .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
            .map((call) => (
              <Card key={call.id} className="opacity-70">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{call.title}</h3>
                      {call.description && (
                        <p className="text-sm text-gray-600 mt-1">{call.description}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{format(new Date(call.scheduledAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{format(new Date(call.scheduledAt), 'h:mm a')}</span>
                        </div>
                        <div className="flex items-center">
                          <span>•</span>
                          <span className="ml-2">{call.duration || 30} min</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        call.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {call.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
          {videoCalls.filter(call => call.status === 'COMPLETED' || call.status === 'CANCELLED').length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No past video calls</h3>
              <p className="mt-1 text-sm text-gray-500">Your completed or cancelled calls will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video call interface */}
      {isInCall && currentCall && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div ref={remoteVideoRef} className="flex-1" />
          <div ref={localVideoRef} className="flex-1" />
          <div className="flex justify-end p-4">
            <Button onClick={toggleMute}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button onClick={toggleVideo}>
              {isVideoOn ? <VideoOff /> : <VideoIcon />}
            </Button>
            <Button onClick={toggleScreenShare}>
              {isScreenSharing ? <Monitor /> : <PhoneOff />}
            </Button>
            <Button onClick={leaveCall}>Leave Call</Button>
          </div>
        </div>
      )}
      {/* Schedule Call Dialog */}
      <ScheduleCallDialog 
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  );
}