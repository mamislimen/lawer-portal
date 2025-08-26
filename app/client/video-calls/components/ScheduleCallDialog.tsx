"use client";

import { useState, useEffect } from "react";
import { format, addHours } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppointmentType = "CONSULTATION" | "CASE_REVIEW" | "COURT_APPEARANCE" | "MEETING" | "VIDEO_CALL" | "PHONE_CALL" | "IN_PERSON" | "OTHER";

interface ScheduleCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated: (appointment: any) => void;
}

export function ScheduleCallDialog({ open, onOpenChange, onAppointmentCreated }: ScheduleCallDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AppointmentType>('VIDEO_CALL');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default start time to now + 1 hour, end time to +2 hours
  useEffect(() => {
    const now = new Date();
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    setStartTime(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
    setEndTime(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
  }, [open]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = new Date(e.target.value);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
    setStartTime(e.target.value);
    setEndTime(end.toISOString().slice(0, 16));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error("You must be signed in to create an appointment");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Video Call',
          description: description || '',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          type: 'MEETING', // Using 'MEETING' as it's a valid type in the API schema
          location: location || 'Online',
          notes: notes || 'Video call appointment',
          status: 'SCHEDULED',
          clientId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create video call appointment');
      }

      const newAppointment = await response.json();
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setNotes('');
      
      // Notify parent component
      onAppointmentCreated(newAppointment);
      
      toast.success("Video call scheduled successfully!");
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error scheduling video call:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to schedule video call');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule a Video Call</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new video call appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for the call"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location (e.g., Zoom, Google Meet)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime}
                  className="w-full"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for the call"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Video Call'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
