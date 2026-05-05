"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  CheckCircle2, 
  School, 
  Mail, 
  Phone, 
  Copy, 
  Eye,
  ShieldCheck,
  BookOpen
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AdminDataTable } from "@/components/admin/DataTable"

export type ApprovedTeacher = {
  id: string
  name: string
  email: string
  mobile: string
  listOfSubjects: string[]
  teacherStatus: string
  profileImage?: string
}

export default function ApprovedTeachersPage() {
  const router = useRouter()
  const [data, setData] = React.useState<ApprovedTeacher[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/approve-teacher')
        if (!res.ok) throw new Error('Network response was not ok');
        const teachers = await res.json()
        setData(teachers)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [])

  const columns: ColumnDef<ApprovedTeacher>[] = [
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
      header: "Trust Status",
      cell: ({ row }) => (
        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={12} />
          Verified Account
        </Badge>
      ),
    },
    {
      accessorKey: "listOfSubjects",
      header: "Departments",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
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
      accessorKey: "email",
      header: "Contact",
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
      header: "Ops",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-white/5 bg-white/5 hover:bg-emerald-600 hover:text-white transition-all font-bold px-4 h-9"
              onClick={() => router.push(`/admin/teachers/${row.original.id}`)}
           >
              <Eye size={14} className="mr-2" /> Profile
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10"><MoreHorizontal size={18} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#111827] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-3 py-2">Quick Access</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl focus:bg-white/5 focus:text-blue-400 cursor-pointer py-2.5" onClick={() => navigator.clipboard.writeText(row.original.id)}>
                  <Copy size={16} className="mr-3 text-gray-400" /> Copy System ID
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <AdminDataTable
        columns={columns}
        data={data}
        title="Verified Educators"
        subtitle="Full directory of teachers who have successfully passed the verification process"
        icon={<CheckCircle2 size={28} />}
        filterColumn="name"
        filterPlaceholder="Search verified teachers..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["email"]}
      />
    </div>
  )
}