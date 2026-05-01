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
  GraduationCap,
  Mail,
  Phone
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
import { AdminDataTable } from "@/components/admin/DataTable";

export type Student = {
  id: string
  name: string
  email: string
  mobile: string
  profileImage?: string
}

export default function StudentDataTable() {
  const router = useRouter()
  const [data, setData] = React.useState<Student[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete student");
      setData((prev) => prev.filter((student) => student.id !== id));
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
          Student Name <ArrowUpDown className="ml-2 h-3 w-3" />
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
      accessorKey: "email",
      header: "Contact Channels",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
           <div className="flex items-center gap-2.5 text-xs text-gray-300 font-medium">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400"><Mail size={12} /></div>
              {row.original.email}
           </div>
           <div className="flex items-center gap-2.5 text-xs text-gray-400 font-medium">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400"><Phone size={12} /></div>
              {row.original.mobile}
           </div>
        </div>
      )
    },
    {
      id: "actions",
      header: "Management",
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
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-3 py-2">Quick Actions</DropdownMenuLabel>
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

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/students?status=confirmed')
        if (!response.ok) throw new Error('System error: Failed to retrieve student data');
        const students = await response.json()
        setData(students)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  return (
    <div className="p-4 md:p-8">
      <AdminDataTable
        columns={columns}
        data={data}
        title="Student Directory"
        subtitle="Complete database of all confirmed students on the platform"
        icon={<GraduationCap size={28} />}
        filterColumn="name"
        filterPlaceholder="Search students by name..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["email"]}
      />
    </div>
  )
}
