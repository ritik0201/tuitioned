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
        <Button variant="ghost" className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 p-0 font-bold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Teacher Profile <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800 shadow-md ring-2 ring-emerald-500/10 shrink-0">
            <AvatarImage src={row.original.profileImage} />
            <AvatarFallback className="bg-emerald-600 text-sm text-white font-black">{row.original.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
             <span className="font-black text-sm text-slate-900 dark:text-white tracking-tight truncate">{row.original.name}</span>
             <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5 truncate">{row.original.id}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "listOfSubjects",
      header: "Departments",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {row.original.listOfSubjects?.slice(0, 3).map((sub, i) => (
            <Badge key={i} variant="outline" className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
              {sub}
            </Badge>
          ))}
          {(row.original.listOfSubjects?.length || 0) > 3 && (
            <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
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
        <div className="flex flex-col gap-1 min-w-0">
           <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 truncate">
              <Mail size={12} className="text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="truncate">{row.original.email}</span>
           </div>
           <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              <Phone size={12} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{row.original.mobile}</span>
           </div>
        </div>
      )
    },
    {
      id: "actions",
      header: "Ops",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 shrink-0">
           <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-emerald-600 hover:text-white transition-all font-bold px-3.5 h-8 cursor-pointer text-xs"
              onClick={() => router.push(`/admin/teachers/${row.original.id}`)}
           >
              <Eye size={13} className="mr-1.5" /> Profile
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"><MoreHorizontal size={16} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl shadow-2xl p-2">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-black px-3 py-2">Quick Access</DropdownMenuLabel>
                <DropdownMenuItem className="rounded-xl focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-blue-600 dark:focus:text-blue-400 cursor-pointer py-2.5 text-xs" onClick={() => navigator.clipboard.writeText(row.original.id)}>
                  <Copy size={15} className="mr-2.5 text-slate-400" /> Copy System ID
                </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full max-w-[1600px] mx-auto">
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