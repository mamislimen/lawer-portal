"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarPlus, Calendar, Clock } from "lucide-react";
import { ScheduleCallDialog } from "./components/ScheduleCallDialog";
import VideoCallRoom from "@/components/video-call-room";


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
  duration: number | null;
  roomName: string;
  isHost: boolean;
}

export default function ClientVideoCallsPage() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { data: session, status } = useSession() as { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };

  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const [currentCall, setCurrentCall] = useState<VideoCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  const fetchVideoCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments?type=MEETING");
      if (!response.ok) throw new Error("Failed to fetch video calls");
      
      const appointments = await response.json();
      
      const videoCallsData = appointments.map((appt: any) => ({
        id: appt.id,
        title: appt.title,
        description: appt.description,
        status: appt.status,
        scheduledAt: appt.startTime,
        duration: appt.duration || 30,
        roomName: `appointment_${appt.id}`,
        isHost: (session?.user as { id: string })?.id === appt.lawyerId,
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

  const handleAppointmentCreated = async () => {
    await fetchVideoCalls();
    toast({
      title: "Success",
      description: "Video call scheduled successfully!",
    });
  };

  const handleJoinCall = (call: VideoCall) => {
    if (session?.user) {
      setCurrentCall(call);
      setIsInCall(true);
    } else {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to join a call.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveCall = () => {
    setIsInCall(false);
    setCurrentCall(null);
    toast({
      title: "Success",
      description: "You have left the call.",
    });
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCurrentCall(null);
    // Here you might want to update the call status in the backend
    toast({
      title: "Call Ended",
      description: "The video call has ended.",
    });
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchVideoCalls();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (isInCall && currentCall && session?.user) {
    return (
      <VideoCallRoom
        callId={currentCall.id}
        roomName={currentCall.roomName}
        isHost={currentCall.isHost}
      />
    );
  }

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
                        onClick={() => handleJoinCall(call)}
                        disabled={isInCall}
                        className="whitespace-nowrap"
                      >
                        {isInCall && currentCall?.id === call.id ? (
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

      <ScheduleCallDialog 
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  );
}