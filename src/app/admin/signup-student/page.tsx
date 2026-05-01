"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Loader2, 
  Users, 
  Trash2, 
  Eye, 
  Copy,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Mail,
  Phone,
  Database
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

export type Student = {
  id: string
  name: string
  email: string
  mobile: string,
  studentStatus: 'pending' | 'approved' | 'rejected'
  profileImage?: string
}

export default function SignupStudentDataTable() {
  const router = useRouter()
  const [data, setData] = React.useState<Student[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isMigrating, setIsMigrating] = React.useState(false);

  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/signup-std', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to retrieve signup records');
      const students = await response.json();
      setData(students);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleMigration = async () => {
    if (!confirm("This will update all existing students without a status to 'pending'. Are you sure?")) return;
    setIsMigrating(true);
    try {
      const response = await fetch('/api/migrate-student-status', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Migration failed');
      toast.success(result.message);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Migration failed");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Student['studentStatus']) => {
    try {
      const response = await fetch('/api/signup-std', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Student status updated to ${newStatus}`);
      setData((prev) => prev.map((s) => (s.id === id ? { ...s, studentStatus: newStatus } : s)));
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete student");
      setData((prev) => prev.filter((s) => s.id !== id));
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" className="hover:bg-white/5 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Full Name <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-white/10 shadow-lg ring-2 ring-blue-500/10">
            <AvatarImage src={row.original.profileImage} />
            <AvatarFallback className="bg-blue-600 text-sm text-white font-black">{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
             <span className="font-black text-base text-white tracking-tight">{row.original.name}</span>
             <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-0.5">{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "studentStatus",
      header: "Enrollment Status",
      cell: ({ row }) => {
        const status = row.getValue("studentStatus") as string;
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
      accessorKey: "email",
      header: "Contact Info",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-xs text-gray-300">
              <Mail size={12} className="text-blue-400" />
              {row.original.email}
           </div>
           <div className="flex items-center gap-2 text-xs text-gray-400">
              <Phone size={12} className="text-emerald-400" />
              {row.original.mobile}
           </div>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl border-white/5 bg-white/5 hover:bg-blue-600 hover:text-white transition-all font-bold px-4 h-9"
                onClick={() => router.push(`/admin/students/${student.id}`)}
             >
                <Eye size={14} className="mr-2" /> View
             </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><MoreHorizontal size={18} /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-3 py-2">Lifecycle Management</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-xl focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer py-2.5" onClick={() => handleStatusUpdate(student.id, 'approved')}>
                    <ShieldCheck size={16} className="mr-3" /> Approve Signup
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer py-2.5" onClick={() => handleStatusUpdate(student.id, 'rejected')}>
                    <ShieldAlert size={16} className="mr-3" /> Reject Signup
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-blue-400 cursor-pointer py-2.5" onClick={() => navigator.clipboard.writeText(student.id)}>
                    <Copy size={16} className="mr-3 text-gray-400" /> Copy System ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5 my-1" />
                  <DropdownMenuItem onClick={() => handleDelete(student.id)} className="rounded-xl text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer py-2.5">
                    <Trash2 size={16} className="mr-3" /> Remove Record
                  </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-end mb-6">
        <Button onClick={handleMigration} disabled={isMigrating} variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-12 px-6">
          {isMigrating ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Migration...</>
          ) : <><Database size={18} className="mr-2" /> Sync Legacy Data</>}
        </Button>
      </div>
      <AdminDataTable
        columns={columns}
        data={data}
        title="Signup Registrations"
        subtitle="Manage new student signups and account approvals"
        icon={<Users size={28} />}
        filterColumn="name"
        filterPlaceholder="Search registrations by name..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["email"]}
      />
    </div>
  )
}