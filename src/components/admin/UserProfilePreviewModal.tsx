"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  X,
  Maximize2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface UserPreviewData {
  id: string;
  name: string;
  role?: "teacher" | "student" | "booking" | "user" | string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  status?: string;
  grade?: string;
  fatherName?: string;
  listOfSubjects?: string[];
  subject?: string;
  topic?: string;
  bookingDateAndTime?: string;
  teacherName?: string;
  city?: string;
  country?: string;
  address?: string | { street?: string; city?: string; state?: string; country?: string };
  viewHref?: string;
  editHref?: string;
  extraDetails?: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }[];
}

interface UserProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: UserPreviewData | null;
}

export function extractPreviewFromRow(item: any): UserPreviewData | null {
  if (!item || typeof item !== "object") return null;

  const id = item.id || item._id || item.studentId?._id || item.teacherId?._id || "";
  const name =
    item.name ||
    item.fullName ||
    item.studentName ||
    item.studentId?.fullName ||
    item.teacherName ||
    item.teacherId?.fullName;

  if (!name && !id) return null;

  const email = item.email || item.studentId?.email || item.teacherId?.email || "";
  const mobile = item.mobile || item.studentId?.mobile || item.teacherId?.mobile || "";
  const profileImage =
    item.profileImage ||
    item.studentId?.profileImage ||
    item.teacherId?.profileImage ||
    "";

  let extraDetails: { label: string; value: string | React.ReactNode; icon?: React.ReactNode }[] | undefined = undefined;

  let role = item.role;
  if (!role) {
    if (item.teacherStatus !== undefined || item.listOfSubjects !== undefined) {
      role = "teacher";
    } else if (item.studentStatus !== undefined || item.grade !== undefined) {
      role = "student";
    } else if (item.bookingDateAndTime !== undefined || item.topic !== undefined) {
      role = "booking";
    } else if (item.paymentId !== undefined || item.amount !== undefined) {
      role = "transaction";
      extraDetails = [
        { label: "Payment Ref", value: String(item.paymentId || "N/A") },
        { label: "Amount", value: `₹${item.amount || 0}` },
        { label: "Date", value: String(item.date || "N/A") },
      ];
    } else {
      role = "user";
    }
  }

  const status = item.teacherStatus || item.studentStatus || item.status || "";

  let viewHref = "";
  let editHref = "";
  if (role === "teacher" && id) {
    viewHref = `/admin/teachers/${id}`;
    editHref = `/admin/teachers/${id}?edit=true`;
  } else if (role === "student" && id) {
    viewHref = `/admin/students/${id}`;
    editHref = `/admin/students/${id}?edit=true`;
  } else if (role === "booking" && id) {
    viewHref = `/admin/democlass-student/${id}`;
  }

  return {
    id: String(id),
    name: String(name || "Unknown"),
    role,
    email: email ? String(email) : undefined,
    mobile: mobile && mobile !== "N/A" ? String(mobile) : undefined,
    profileImage: profileImage ? String(profileImage) : undefined,
    status: status ? String(status) : undefined,
    grade: item.grade || item.studentId?.grade,
    fatherName: item.fatherName || item.studentId?.fatherName,
    listOfSubjects: item.listOfSubjects,
    subject: item.subject,
    topic: item.topic,
    bookingDateAndTime: item.bookingDateAndTime,
    teacherName: item.teacherId?.fullName,
    city: item.city || item.address?.city || item.studentId?.address?.city,
    country: item.country || item.address?.country || item.studentId?.address?.country,
    viewHref,
    editHref,
    extraDetails,
  };
}

export default function UserProfilePreviewModal({
  isOpen,
  onClose,
  data,
}: UserProfilePreviewModalProps) {
  const router = useRouter();
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!data) return null;

  const avatarUrl =
    data.profileImage ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=4f46e5,3b82f6,10b981,8b5cf6`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower === "approved" || lower === "confirmed" || lower === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck size={13} className="text-emerald-500" />
          {status.toUpperCase()}
        </span>
      );
    }
    if (lower === "pending") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock size={13} className="text-amber-500" />
          PENDING
        </span>
      );
    }
    if (lower === "rejected" || lower === "cancelled" || lower === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldAlert size={13} className="text-rose-500" />
          {status.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {status.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    const lower = role.toLowerCase();
    if (lower === "teacher" || lower === "tutor") {
      return (
        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm">
          TUTOR / TEACHER
        </Badge>
      );
    }
    if (lower === "student") {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm">
          STUDENT
        </Badge>
      );
    }
    if (lower === "booking") {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-lg shadow-sm">
          DEMO BOOKING
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-extrabold uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-lg">
        {role.toUpperCase()}
      </Badge>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] sm:max-w-xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl z-[1200]"
        >
          {/* Header Ambient Background with Close Button */}
          <div className="relative shrink-0 pt-8 pb-4 px-6 bg-gradient-to-b from-indigo-500/10 via-slate-100/50 to-transparent dark:from-indigo-600/20 dark:via-slate-900/40 dark:to-transparent border-b border-slate-100 dark:border-slate-800/60">
            <DialogClose asChild>
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all cursor-pointer shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </DialogClose>

            {/* BIG SIZE VIEW OF PROFILE PIC */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer" onClick={() => setIsPhotoZoomed(true)}>
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-indigo-500/20 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-500/40">
                  <img
                    src={avatarUrl}
                    alt={data.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
                    }}
                  />
                </div>
                {/* Click to enlarge overlay */}
                <div className="absolute inset-0 rounded-3xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-[2px]">
                  <Maximize2 size={22} className="animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wide uppercase">Click to Enlarge</span>
                </div>
              </div>

              {/* Name & Badges */}
              <div className="mt-4 space-y-1.5">
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {data.name}
                </DialogTitle>
                <div className="flex items-center justify-center gap-2 flex-wrap pt-0.5">
                  {getRoleBadge(data.role)}
                  {getStatusBadge(data.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Information Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">
            {/* System ID Row */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  System ID
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {data.id}
                </span>
              </div>
              <button
                onClick={() => handleCopy(data.id, "ID")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                title="Copy ID"
              >
                {copiedField === "ID" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.email && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${data.email}`}
                      className="font-semibold text-xs text-slate-900 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition"
                    >
                      {data.email}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(data.email!, "Email")}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 transition shrink-0"
                    title="Copy Email"
                  >
                    {copiedField === "Email" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              )}

              {data.mobile && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Contact Mobile
                    </span>
                    <a
                      href={`tel:${data.mobile}`}
                      className="font-semibold text-xs text-slate-900 dark:text-slate-200 hover:text-emerald-600 truncate block transition"
                    >
                      {data.mobile}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(data.mobile!, "Mobile")}
                    className="p-1 rounded text-slate-400 hover:text-emerald-600 transition shrink-0"
                    title="Copy Mobile"
                  >
                    {copiedField === "Mobile" ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              )}
            </div>

            {/* Academic & Parent Info (If available) */}
            {(data.grade || data.fatherName) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.grade && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Grade Level
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-200">
                        {data.grade}
                      </span>
                    </div>
                  </div>
                )}

                {data.fatherName && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                      <User size={16} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Guardian / Parent
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-200">
                        {data.fatherName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjects (Teachers & Classes) */}
            {data.listOfSubjects && data.listOfSubjects.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-indigo-500" /> Teaching Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.listOfSubjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Class / Session Details (If applicable) */}
            {(data.subject || data.topic || data.bookingDateAndTime || data.teacherName) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-500" /> Session Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {data.subject && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Subject:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{data.subject}</span>
                    </div>
                  )}
                  {data.topic && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Topic:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{data.topic}</span>
                    </div>
                  )}
                  {data.bookingDateAndTime && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Scheduled:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(data.bookingDateAndTime).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  )}
                  {data.teacherName && (
                    <div>
                      <span className="text-slate-400 text-[11px] block">Assigned Tutor:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{data.teacherName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location / Residence */}
            {(data.city || data.country || (data.address && typeof data.address === "string")) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Location & Residence
                  </span>
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {[data.city, data.country].filter(Boolean).join(", ") ||
                      (typeof data.address === "string" ? data.address : "")}
                  </span>
                </div>
              </div>
            )}

            {/* Extra Details (Transactions, etc.) */}
            {data.extraDetails && data.extraDetails.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.extraDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {detail.label}
                    </span>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Close
              </Button>
            </DialogClose>

            <div className="flex items-center gap-2">
              {data.editHref && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onClose();
                    router.push(data.editHref!);
                  }}
                  className="rounded-xl border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-bold text-xs flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Edit
                </Button>
              )}

              {data.viewHref && (
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(data.viewHref!);
                  }}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={13} /> View Full Profile
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FULL-SIZE PHOTO ENLARGED LIGHTBOX DIALOG */}
      <Dialog open={isPhotoZoomed} onOpenChange={setIsPhotoZoomed}>
        <DialogContent
          showCloseButton={true}
          className="w-[95vw] sm:max-w-lg p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[1300] gap-3"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              {data.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {data.role || "User"} High-Resolution Profile Photo
            </DialogDescription>
          </DialogHeader>

          <div className="relative w-full aspect-square max-h-[65vh] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <img
              src={avatarUrl}
              alt={data.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {getRoleBadge(data.role)}
              {getStatusBadge(data.status)}
            </div>

            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPhotoZoomed(false)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold px-4"
              >
                Back to Details
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
