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
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";

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

export interface TeacherOptionItem {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  teacherStatus?: string;
}

export default function DemoClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [booking, setBooking] = useState<DemoClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherOptionItem[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [teacherIdInput, setTeacherIdInput] = useState("");
  const [joinLinkInput, setJoinLinkInput] = useState("");
  const [bookingDateAndTimeInput, setBookingDateAndTimeInput] = useState("");
  const [statusInput, setStatusInput] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [timeZoneInput, setTimeZoneInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { id } = React.use(params);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
        }
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

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

  const teacherSelectOptions = React.useMemo(() => {
    const opts: SearchableOption[] = [
      {
        value: "",
        label: "None / Unassigned",
        sublabel: "No teacher assigned",
      },
    ];

    teachers.forEach((t) => {
      opts.push({
        value: t.id,
        label: t.name || "Unnamed Teacher",
        sublabel: t.email ? `${t.email}${t.mobile && t.mobile !== "N/A" ? " • " + t.mobile : ""}` : undefined,
        badge: t.teacherStatus,
      });
    });

    if (booking?.teacherId?._id && !opts.some((o) => o.value === booking.teacherId?._id)) {
      opts.push({
        value: booking.teacherId._id,
        label: booking.teacherId.fullName || "Assigned Teacher",
        sublabel: booking.teacherId.email,
      });
    }

    return opts;
  }, [teachers, booking]);

  const timeZoneSelectOptions = React.useMemo(() => {
    let list: string[] = [];
    try {
      // @ts-ignore
      list = Intl.supportedValuesOf("timeZone");
    } catch (e) {
      list = [
        "UTC",
        "Asia/Kolkata",
        "America/New_York",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Asia/Dubai",
        "Australia/Sydney",
      ];
    }
    return list.map((tz) => ({
      value: tz,
      label: tz,
    }));
  }, []);

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
    <div className="w-full min-h-screen bg-[#030712] p-6 text-white">
      {/* Student Details Card */}
      <Card className="w-full shadow-xl border border-gray-800 bg-[#111827] text-white mb-6">
        <CardHeader className="bg-[#1f2937] p-8 flex flex-col md:flex-row md:items-center gap-6 rounded-t-xl border-b border-gray-800">
          <Avatar className="h-24 w-24 border-2 border-blue-500">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.fullName}`}
              alt={student.fullName}
            />
            <AvatarFallback className="text-3xl bg-blue-600 text-white font-bold">
              {student.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-4xl font-bold text-white">{student.fullName}</CardTitle>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-2">
              <Hash className="h-4 w-4 text-gray-400" /> <span>{student._id}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {student.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                {student.mobile || "Not provided"}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Demo Class Details Card */}
      <Card className="w-full shadow-xl border border-gray-800 bg-[#111827] text-white mb-6">
        <CardHeader className="border-b border-gray-800 bg-[#1f2937]/50">
          <CardTitle className="text-2xl font-bold text-white">Demo Class Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-sm p-6">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Father's Name</p>
              <p className="font-normal text-white">{booking.fatherName || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Location</p>
              <p className="font-normal text-white">{`${booking.city || ""}${booking.city && booking.country ? ", " : ""}${booking.country || ""}` || "Not provided"}</p>
            </div>
          </div>
          <div />
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Topic</p>
              <p className="font-normal text-white">{booking.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Subject</p>
              <p className="font-normal text-white">{booking.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Demo Date & Time</p>
              <p className="font-normal text-white">
                {new Date(booking.bookingDateAndTime).toLocaleString(undefined, {
                  timeZone: booking.timeZone,
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Status</p>
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase text-[11px] px-2.5 py-0.5">
                {booking.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Time Zone</p>
              <p className="font-normal text-white">{booking.timeZone || "Not Set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Assigned Teacher</p>
              <p className="font-normal text-white">{booking.teacherId?.fullName || "Not Assigned"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LinkIcon className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-gray-400">Join Link</p>
              <p className="font-normal text-white truncate max-w-[200px]">{booking.joinLink || "Not Set"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions Card */}
      <Card className="w-full shadow-xl border border-gray-800 bg-[#111827] text-white">
        <CardHeader className="border-b border-gray-800 bg-[#1f2937]/50">
          <CardTitle className="text-2xl font-bold text-white">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Select Teacher
              </label>
              <SearchableSelect
                options={teacherSelectOptions}
                value={teacherIdInput}
                onChange={setTeacherIdInput}
                placeholder="Select a teacher..."
                searchPlaceholder="Search teacher by name or email..."
                emptyMessage="No teacher found."
                loading={loadingTeachers}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Class Join Link
              </label>
              <Input 
                placeholder="Enter Meeting URL" 
                value={joinLinkInput} 
                onChange={(e) => setJoinLinkInput(e.target.value)}
                className="bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-400 h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Demo Date & Time
              </label>
              <Input 
                type="datetime-local"
                value={bookingDateAndTimeInput} 
                onChange={(e) => setBookingDateAndTimeInput(e.target.value)}
                className="bg-[#1f2937] border-gray-700 text-white placeholder:text-gray-400 h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Time Zone
              </label>
              <SearchableSelect
                options={timeZoneSelectOptions}
                value={timeZoneInput}
                onChange={setTimeZoneInput}
                placeholder="Select a timezone..."
                searchPlaceholder="Search timezone..."
                emptyMessage="No timezone found."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Status
              </label>
              <Select value={statusInput} onValueChange={(value) => setStatusInput(value as any)}>
                <SelectTrigger className="bg-[#1f2937] border-gray-700 text-white h-10 w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] text-white border border-gray-700 shadow-2xl">
                  <SelectItem value="pending" className="hover:bg-blue-600 focus:bg-blue-600 text-white">Pending</SelectItem>
                  <SelectItem value="confirmed" className="hover:bg-blue-600 focus:bg-blue-600 text-white">Confirmed</SelectItem>
                  <SelectItem value="completed" className="hover:bg-blue-600 focus:bg-blue-600 text-white">Completed</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-blue-600 focus:bg-blue-600 text-white">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating} 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            {isUpdating ? "Updating..." : "Update Details"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}