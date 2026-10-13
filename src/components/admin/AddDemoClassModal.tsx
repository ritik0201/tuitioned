"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { getTimezoneSelectOptions } from "@/lib/timezone";
import { toast } from "sonner";
import {
  CalendarPlus,
  BookOpen,
  Calendar,
  User,
  GraduationCap,
  Globe,
  Loader2,
  CheckCircle2,
  Mail,
  Link2,
  Sparkles,
  X,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { DemoClassBooking } from "@/app/admin/democlass-student/page";

const POPULAR_SUBJECTS = [
  "Maths",
  "Science",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Coding",
  "History",
];

interface AddDemoClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: DemoClassBooking | null;
  onSuccess: () => void;
}

interface TeacherOption {
  id: string;
  name: string;
  email: string;
  listOfSubjects?: string[];
  teacherStatus?: string;
}

export function AddDemoClassModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: AddDemoClassModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [bookingDateAndTime, setBookingDateAndTime] = useState("");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [teacherId, setTeacherId] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending">("confirmed");
  const [sendEmail, setSendEmail] = useState(true);

  // Fetch teachers when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchTeachers = async () => {
      try {
        setLoadingTeachers(true);
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
        }
      } catch (err) {
        console.error("Failed to load teachers:", err);
      } finally {
        setLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, [isOpen]);

  // Pre-fill form when booking changes
  useEffect(() => {
    if (booking && isOpen) {
      // Default to tomorrow 10:00 AM local time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const offset = tomorrow.getTimezoneOffset();
      const localTomorrow = new Date(tomorrow.getTime() - offset * 60 * 1000);
      setBookingDateAndTime(localTomorrow.toISOString().slice(0, 16));

      // Pre-fill student academic details from previous booking
      setSubject("");
      setTopic("");
      setGrade(booking.grade || "Year 9");
      setFatherName(booking.fatherName || booking.studentName || booking.studentId?.fullName || "");
      setCity(booking.city || booking.studentId?.address?.city || "");
      setCountry(booking.country || booking.studentId?.address?.country || "");
      setTimeZone(
        booking.timeZone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "Asia/Kolkata"
      );
      setTeacherId("");
      setJoinLink("");
      setStatus("confirmed");
      setSendEmail(true);
    }
  }, [booking, isOpen]);

  if (!booking) return null;

  const studentName = booking.studentName || booking.studentId?.fullName || "Student";
  const studentEmail = booking.studentId?.email || "";
  const studentId = booking.studentId?._id;

  const timezoneOptions = getTimezoneSelectOptions();

  const teacherSelectOptions: SearchableOption[] = [
    {
      value: "",
      label: "Unassigned (Assign Later)",
      sublabel: "No teacher assigned yet",
    },
    ...teachers.map((t) => ({
      value: t.id,
      label: t.name,
      sublabel: `${t.email}${t.listOfSubjects?.length ? ` • ${t.listOfSubjects.join(", ")}` : ""}`,
      badge: t.teacherStatus === "approved" ? "Approved" : undefined,
    })),
  ];

  const handleToggleSubjectChip = (chip: string) => {
    if (!subject) {
      setSubject(chip);
      return;
    }
    const currentList = subject
      .split(",")
      .map((s) => s.trim().toLowerCase());
    if (currentList.includes(chip.toLowerCase())) {
      const filtered = subject
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.toLowerCase() !== chip.toLowerCase());
      setSubject(filtered.join(", "));
    } else {
      setSubject(`${subject.trim()}, ${chip}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter or select at least one subject.");
      return;
    }
    if (!bookingDateAndTime) {
      toast.error("Please select a date and time for the demo class.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/demoClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName,
          email: studentEmail,
          mobile: booking?.studentId?.mobile || (booking as any)?.mobile || undefined,
          fatherName: fatherName.trim() || studentName,
          grade: grade.trim() || "General",
          subject: subject.trim(),
          topic: topic.trim(),
          bookingDateAndTime: new Date(bookingDateAndTime).toISOString(),
          timeZone,
          teacherId: teacherId || undefined,
          joinLink: joinLink.trim() || undefined,
          city: city.trim() || "Online",
          country: country.trim() || "Online",
          status,
          sendEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to schedule demo class.");
      }

      toast.success(`Demo class successfully added for ${studentName}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-3xl max-h-[84vh] h-auto flex flex-col p-0 gap-0 overflow-hidden bg-[#0f172a] border border-slate-800 text-slate-100 rounded-3xl shadow-2xl z-50 transition-all duration-200"
      >
        {/* Pinned Header */}
        <div className="shrink-0 p-5 sm:p-6 pb-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 ring-4 ring-indigo-500/5">
                <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Add Another Demo Class
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Schedule an additional trial class session for this student via Admin.
                </DialogDescription>
              </div>
            </div>

            {/* Custom Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Student Profile Identity Card */}
          <div className="mt-3.5 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0 border border-indigo-500/30 ring-2 ring-indigo-500/20">
                <AvatarImage src={booking.studentId?.profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs">
                  {studentName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white truncate">{studentName}</span>
                  <Badge variant="outline" className="text-[10px] py-0 px-2 bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-mono">
                    ID: {studentId?.slice(-6)}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 font-mono truncate">{studentEmail}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {booking.grade && (
                <div className="text-right px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    Grade
                  </span>
                  <span className="text-xs text-indigo-300 font-semibold">{booking.grade}</span>
                </div>
              )}
              {booking.city && (
                <div className="hidden sm:block text-right px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    City
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{booking.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Body - Scrollable Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {/* Subject(s) Group */}
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                  Subject(s) <span className="text-rose-400">*</span>
                </Label>
                <span className="text-[11px] text-slate-400">Click chips to toggle or edit below</span>
              </div>

              {/* Quick Subject Chips */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SUBJECTS.map((chip) => {
                  const isSelected = subject
                    .toLowerCase()
                    .split(",")
                    .map((s) => s.trim())
                    .includes(chip.toLowerCase());
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleSubjectChip(chip)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500"
                          : "bg-slate-800/90 text-slate-300 hover:bg-slate-700/80 border border-slate-700/60"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Maths, Science, Advanced English"
                className="bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-9.5 text-sm"
                required
              />
            </div>

            {/* Topic / Focus Area */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Topic or Focus Area (Optional)
              </Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Year 9 NAPLAN practice, Quadratic Equations, Creative Essay"
                className="bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 h-9.5 text-sm"
              />
            </div>

            {/* Schedule & Timezone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  Date & Time <span className="text-rose-400">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={bookingDateAndTime}
                  onChange={(e) => setBookingDateAndTime(e.target.value)}
                  className="bg-slate-900/80 border-slate-700/80 text-white rounded-xl focus:border-indigo-500 [color-scheme:dark] h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  Time Zone
                </Label>
                <SearchableSelect
                  options={timezoneOptions}
                  value={timeZone}
                  onChange={setTimeZone}
                  placeholder="Select Timezone..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Teacher Assignment & Meeting Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  Assign Teacher (Optional)
                </Label>
                <SearchableSelect
                  options={teacherSelectOptions}
                  value={teacherId}
                  onChange={setTeacherId}
                  placeholder={loadingTeachers ? "Loading teachers..." : "Choose Teacher or Unassigned"}
                  disabled={loadingTeachers}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-emerald-400" />
                  Meeting Link (Optional)
                </Label>
                <Input
                  value={joinLink}
                  onChange={(e) => setJoinLink(e.target.value)}
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  className="bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 h-10 text-sm"
                />
              </div>
            </div>

            {/* Academic Info & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                  Grade / Year Level
                </Label>
                <Input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Year 9, Grade 10"
                  className="bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 h-9.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  Parent / Guardian Name
                </Label>
                <Input
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Parent Name"
                  className="bg-slate-900/80 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:border-indigo-500 h-9.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  Initial Status
                </Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="bg-[#1f2937] border-gray-700 text-white rounded-md focus:border-indigo-500 h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-gray-700 text-white">
                    <SelectItem value="confirmed" className="cursor-pointer focus:bg-indigo-600 focus:text-white">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="pending" className="cursor-pointer focus:bg-indigo-600 focus:text-white">
                      Pending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Notification Preference */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Send Confirmation Email</span>
                  <span className="text-[11px] text-slate-400">
                    Notifies {studentEmail} with session details and calendar link.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                id="sendEmailCheckbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded accent-indigo-600 cursor-pointer shrink-0"
              />
            </div>
          </div>

          {/* Pinned Footer Actions */}
          <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Will be scheduled for </span>
              <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                {studentName}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={submitting}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-4 h-9 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl px-5 h-9 text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Schedule Demo Class
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
