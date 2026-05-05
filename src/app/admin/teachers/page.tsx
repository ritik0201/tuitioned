"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  Copy,
  School,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable } from "@/components/admin/DataTable";

export type Teacher = {
  id: string
  name: string
  email: string
  mobile: string
  listOfSubjects?: string[]
  teacherStatus?: 'pending' | 'approved' | 'rejected'
  profileImage?: string
}

export default function TeacherDataTable() {
  const router = useRouter()
  const [data, setData] = React.useState<Teacher[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleStatusUpdate = async (id: string, newStatus: Teacher['teacherStatus']) => {
    try {
      const response = await fetch('/api/teachers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, teacherStatus: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Teacher status updated to ${newStatus}`);
      setData((prev) => prev.map((t) => (t.id === id ? { ...t, teacherStatus: newStatus } : t)));
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const response = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete teacher");
      setData((prev) => prev.filter((t) => t.id !== id));
      toast.success("Teacher deleted successfully");
    } catch (error) {
      toast.error("Failed to delete teacher");
    }
  };

  const columns: ColumnDef<Teacher>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" className="hover:bg-white/5 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Teacher Profile <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-white/10 shadow-lg ring-2 ring-emerald-500/10">
            <AvatarImage src={row.original.profileImage} />
            <AvatarFallback className="bg-emerald-600 text-sm text-white font-black">{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
             <span className="font-black text-base text-white tracking-tight">{row.original.name}</span>
             <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-0.5">{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "teacherStatus",
      header: "Security Status",
      cell: ({ row }) => {
        const status = row.getValue("teacherStatus") as string;
        const config = {
          approved: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <ShieldCheck size={12} /> },
          rejected: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: <ShieldAlert size={12} /> },
          pending: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <Clock size={12} /> },
        }[status || 'pending'] || { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <Clock size={12} /> };

        return (
          <Badge className={`${config.color} border flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>
            {config.icon}
            {status || 'pending'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "listOfSubjects",
      header: "Expertise",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.listOfSubjects?.slice(0, 3).map((sub, i) => (
            <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-gray-400 text-[10px]">
              {sub}
            </Badge>
          ))}
          {(row.original.listOfSubjects?.length || 0) > 3 && (
            <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 text-[10px]">
              +{(row.original.listOfSubjects?.length || 0) - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      id: "actions",
      header: "Management",
      cell: ({ row }) => {
        const teacher = row.original
        return (
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-white/5 bg-white/5 hover:bg-emerald-600 hover:text-white transition-all font-bold px-4 h-9"
                onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
             >
                <Eye size={14} className="mr-2" /> View
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><MoreHorizontal size={18} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-3 py-2">Account Control</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer py-2.5" onClick={() => handleStatusUpdate(teacher.id, 'approved')}>
                    <ShieldCheck size={16} className="mr-3" /> Approve Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer py-2.5" onClick={() => handleStatusUpdate(teacher.id, 'rejected')}>
                    <ShieldAlert size={16} className="mr-3" /> Reject Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-orange-500/10 focus:text-orange-400 cursor-pointer py-2.5" onClick={() => handleStatusUpdate(teacher.id, 'pending')}>
                    <Clock size={16} className="mr-3" /> Set to Pending
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-blue-400 cursor-pointer py-2.5" onClick={() => navigator.clipboard.writeText(teacher.id)}>
                    <Copy size={16} className="mr-3 text-gray-400" /> Copy System ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem onClick={() => handleDelete(teacher.id)} className="rounded-xl text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer py-2.5">
                    <Trash2 size={16} className="mr-3" /> Remove Record
                  </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/teachers')
        if (!response.ok) throw new Error('Failed to retrieve teacher data');
        const teachers = await response.json()
        setData(teachers)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <AdminDataTable
        columns={columns}
        data={data}
        title="Teacher Faculty"
        subtitle="Full directory of educators and subject experts"
        icon={<School size={28} />}
        filterColumn="name"
        filterPlaceholder="Search faculty by name..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["listOfSubjects"]}
      />
    </div>
  )
}
