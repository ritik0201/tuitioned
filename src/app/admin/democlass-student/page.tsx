"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Video, 
  Calendar, 
  Clock, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Timer,
  BookOpen,
  MapPin,
  ExternalLink,
  CalendarPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getTimezoneDisplay } from "@/lib/timezone"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AdminDataTable } from "@/components/admin/DataTable"
import { AddDemoClassModal } from "@/components/admin/AddDemoClassModal"

export type DemoClassBooking = {
  _id: string
  studentName?: string
  mobile?: string
  studentId: {
    _id: string
    email: string
    fullName?: string
    profileImage?: string
    mobile?: string
    address?: {
      city?: string
      country?: string
    }
  }
  fatherName?: string
  grade?: string
  city?: string
  country?: string
  topic: string
  subject: string
  bookingDateAndTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  timeZone?: string
  teacherId?: {
    _id: string
    fullName: string
    email: string
    mobile?: string
  }
  joinLink?: string
}

export default function DemoClassStudentTable() {
  const router = useRouter()
  const [data, setData] = React.useState<DemoClassBooking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedBookingForNewDemo, setSelectedBookingForNewDemo] = React.useState<DemoClassBooking | null>(null)
  const [isAddDemoModalOpen, setIsAddDemoModalOpen] = React.useState(false)

  const handleStatusUpdate = async (id: string, newStatus: DemoClassBooking['status']) => {
    try {
      const response = await fetch('/api/demoClass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Update failed');
      toast.success(`Session status: ${newStatus}`);
      setData(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const response = await fetch(`/api/demoClass/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Deletion failed");
      setData((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking removed");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<DemoClassBooking>[] = [
    {
      id: "studentName",
      accessorFn: (row) => row.studentName || row.studentId?.fullName,
      header: ({ column }) => (
        <Button variant="ghost" className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Student <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800 ring-2 ring-indigo-500/10">
            <AvatarImage src={row.original.studentId?.profileImage} />
            <AvatarFallback className="bg-indigo-600 text-xs text-white font-black">{(row.getValue("studentName") as string || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
             <span className="font-bold text-sm text-slate-900 dark:text-white">{row.getValue("studentName") || "Unknown Student"}</span>
             <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
               <span>{row.original.studentId?.email}</span>
               {(row.original.mobile || row.original.studentId?.mobile) && (
                 <>
                   <span>•</span>
                   <span>{row.original.mobile || row.original.studentId?.mobile}</span>
                 </>
               )}
             </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Session Details",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <BookOpen size={12} className="text-indigo-500 dark:text-indigo-400" />
              {row.original.subject}
           </div>
           <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{row.original.topic}</div>
        </div>
      )
    },
    {
      accessorKey: "bookingDateAndTime",
      header: "Schedule",
      cell: ({ row }) => {
        const dateVal = row.original.bookingDateAndTime;
        const timeZone = row.original.timeZone;
        const date = new Date(dateVal);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
               <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
               {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
               <Clock size={12} className="text-slate-400" />
               {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
               {timeZone && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 rounded text-[8px] uppercase font-bold">{getTimezoneDisplay(timeZone)}</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Engagement",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = {
          confirmed: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <CheckCircle2 size={12} /> },
          completed: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <ExternalLink size={12} /> },
          cancelled: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: <XCircle size={12} /> },
          pending: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <Timer size={12} /> },
        }[status] || { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <Timer size={12} /> };

        return (
          <Badge className={`${config.color} border flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
            {config.icon}
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Ops",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><MoreHorizontal size={18} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-[#111827] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-3 py-2">Lifecycle</DropdownMenuLabel>
                {booking.status === 'pending' && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking._id, 'confirmed')} className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer py-2.5">
                    <CheckCircle2 size={16} className="mr-3" /> Confirm Session
                  </DropdownMenuItem>
                )}
                {booking.status === 'confirmed' && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking._id, 'completed')} className="rounded-xl focus:bg-blue-500/10 focus:text-blue-400 cursor-pointer py-2.5">
                    <ExternalLink size={16} className="mr-3" /> Mark Completed
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleStatusUpdate(booking._id, 'cancelled')} className="rounded-xl focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer py-2.5">
                  <XCircle size={16} className="mr-3" /> Cancel Session
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={() => {
                    setSelectedBookingForNewDemo(booking);
                    setIsAddDemoModalOpen(true);
                  }} 
                  className="rounded-xl focus:bg-indigo-500/20 focus:text-indigo-300 text-indigo-400 hover:text-indigo-300 cursor-pointer py-2.5 font-semibold"
                >
                  <CalendarPlus size={16} className="mr-3 text-indigo-400" /> Add Another Demo Class
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/democlass-student/${booking._id}`)} className="rounded-xl focus:bg-white/5 focus:text-indigo-400 cursor-pointer py-2.5">
                  <Eye size={16} className="mr-3" /> Details
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem onClick={() => handleDelete(booking._id)} className="rounded-xl text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer py-2.5">
                  <Trash2 size={16} className="mr-3" /> Purge Record
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const fetchDemoBookings = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/demoClass')
      if (!response.ok) throw new Error('Inbound request failure');
      const bookings = await response.json()
      setData(bookings)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDemoBookings()
  }, [fetchDemoBookings])

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <AdminDataTable
        columns={columns}
        data={data}
        title="Demo Sessions"
        subtitle="Inbound requests for trial classes and student evaluations"
        icon={<Video size={28} />}
        filterColumn="studentName"
        filterPlaceholder="Filter by student name..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["bookingDateAndTime"]}
        exportFileName="demo_class_sessions"
        exportFormatter={(item: DemoClassBooking) => ({
          "Booking ID": item._id,
          "Student Name": item.studentName || item.studentId?.fullName || "N/A",
          "Mobile Number": item.mobile || item.studentId?.mobile || "N/A",
          "Student Email": item.studentId?.email || "N/A",
          "Grade / Class": item.grade || "N/A",
          "Subject": item.subject || "N/A",
          "Topic": item.topic || "N/A",
          "Father Name": item.fatherName || "N/A",
          "City": item.city || item.studentId?.address?.city || "N/A",
          "Country": item.country || item.studentId?.address?.country || "N/A",
          "Booking Date & Time": item.bookingDateAndTime ? new Date(item.bookingDateAndTime).toLocaleString() : "N/A",
          "Time Zone": item.timeZone || "N/A",
          "Status": (item.status || "pending").toUpperCase(),
          "Assigned Teacher": item.teacherId?.fullName || "Not Assigned",
          "Teacher Mobile": item.teacherId?.mobile || "N/A",
          "Teacher Email": item.teacherId?.email || "N/A",
          "Meeting Link": item.joinLink || "N/A",
        })}
      />

      <AddDemoClassModal
        isOpen={isAddDemoModalOpen}
        onClose={() => {
          setIsAddDemoModalOpen(false);
          setSelectedBookingForNewDemo(null);
        }}
        booking={selectedBookingForNewDemo}
        onSuccess={fetchDemoBookings}
      />
    </div>
  )
}