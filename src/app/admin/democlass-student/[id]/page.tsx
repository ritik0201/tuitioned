"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Hash, User as UserIcon, MapPin, BookOpen, Calendar, Tag, Clock, Link as LinkIcon, UserCheck, Globe } from "lucide-react";
import { Alert, CircularProgress } from "@mui/material";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export type DemoClassDetails = {
  _id: string;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
    mobile?: string;
  };
  teacherId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  joinLink?: string;
  fatherName?: string;
  city?: string;
  country?: string;
  topic: string;
  subject: string;
  bookingDateAndTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  timeZone?: string;
};

export default function DemoClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [booking, setBooking] = useState<DemoClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherIdInput, setTeacherIdInput] = useState("");
  const [joinLinkInput, setJoinLinkInput] = useState("");
  const [bookingDateAndTimeInput, setBookingDateAndTimeInput] = useState("");
  const [statusInput, setStatusInput] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [timeZoneInput, setTimeZoneInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { id } = React.use(params);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/demoClass/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch demo class details");
        }
        const data = await response.json();
        setBooking(data);
        setTeacherIdInput(data.teacherId?._id || "");
        setJoinLinkInput(data.joinLink || "");
        setStatusInput(data.status || 'pending');
        setTimeZoneInput(data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        if (data.bookingDateAndTime) {
          // Convert to local datetime string for input (YYYY-MM-DDThh:mm)
          const date = new Date(data.bookingDateAndTime);
          const offset = date.getTimezoneOffset();
          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
          setBookingDateAndTimeInput(localDate.toISOString().slice(0, 16));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/demoClass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking?._id,
          teacherId: teacherIdInput,
          joinLink: joinLinkInput,
          bookingDateAndTime: bookingDateAndTimeInput,
          status: statusInput,
          timeZone: timeZoneInput
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Update failed');

      toast.success("Demo class updated successfully");
      
      // Refresh the data to show updated details (especially populated teacher name)
      const refreshRes = await fetch(`/api/demoClass/${id}`);
      const refreshData = await refreshRes.json();
      setBooking(refreshData);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!booking) {
    return <Alert severity="warning">No booking data found.</Alert>;
  }

  const student = booking.studentId;

  return (
    <div className="w-full min-h-screen bg-background p-6">
      {/* Student Details Card */}
      <Card className="w-full shadow-lg border border-border mb-6">
        <CardHeader className="bg-muted/20 p-8 flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.fullName}`}
              alt={student.fullName}
            />
            <AvatarFallback className="text-3xl">
              {student.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-4xl font-bold">{student.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
              <Hash className="h-4 w-4" /> <span>{student._id}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {student.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {student.mobile || "Not provided"}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Demo Class Details Card */}
      <Card className="w-full shadow-lg border border-border mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Demo Class Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Father's Name</p>
              <p className="font-semibold">{booking.fatherName || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-semibold">{`${booking.city || ""}${booking.city && booking.country ? ", " : ""}${booking.country || ""}` || "Not provided"}</p>
            </div>
          </div>
          <div />
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Topic</p>
              <p className="font-semibold">{booking.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Subject</p>
              <p className="font-semibold">{booking.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Demo Date & Time</p>
              <p className="font-semibold">
                {new Date(booking.bookingDateAndTime).toLocaleString(undefined, {
                  timeZone: booking.timeZone,
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge>{booking.status}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Time Zone</p>
              <p className="font-semibold">{booking.timeZone || "Not Set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Assigned Teacher</p>
              <p className="font-semibold">{booking.teacherId?.fullName || "Not Assigned"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Join Link</p>
              <p className="font-semibold truncate max-w-[200px]">{booking.joinLink || "Not Set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions Card */}
      <Card className="w-full shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Teacher ID
              </label>
              <Input 
                placeholder="Enter Teacher ID" 
                value={teacherIdInput} 
                onChange={(e) => setTeacherIdInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Class Join Link
              </label>
              <Input 
                placeholder="Enter Meeting URL" 
                value={joinLinkInput} 
                onChange={(e) => setJoinLinkInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Demo Date & Time
              </label>
              <Input 
                type="datetime-local"
                value={bookingDateAndTimeInput} 
                onChange={(e) => setBookingDateAndTimeInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Time Zone
              </label>
              <Select value={timeZoneInput} onValueChange={setTimeZoneInput}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-background/80 backdrop-blur-sm">
                  {/* @ts-ignore */}
                  {Intl.supportedValuesOf("timeZone").map((tz: string) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Status
              </label>
              <Select value={statusInput} onValueChange={(value) => setStatusInput(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="bg-background/80 backdrop-blur-sm">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating} 
            variant="outline" 
            className="w-full md:w-auto border-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {isUpdating ? "Updating..." : "Update Details"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}