"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Search, BookOpen, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,  
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Box, Typography, Chip, Avatar, CircularProgress } from "@mui/material"
import { motion } from "framer-motion"

export type CourseData = {
  id: string
  courseName: string
  studentId?: string
  studentName: string
  grade: string
  noOfClasses: number
}

export default function StudentDataTable() {
  const router = useRouter()
  const [data, setData] = React.useState<CourseData[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const columns: ColumnDef<CourseData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-gray-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-none"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-gray-500 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 rounded-none"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "courseName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/5 text-gray-300 rounded-none"
          >
            Course Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontSize: '0.875rem', borderRadius: 0 }}>
            <BookOpen size={16} />
          </Avatar>
          <span className="font-semibold text-white">{row.getValue("courseName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/5 text-gray-300 rounded-none"
          >
            Student Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-300">
          <User size={14} className="text-indigo-400" />
          {row.getValue("studentName")}
        </div>
      ),
    },
    {
      accessorKey: "noOfClasses",
      header: "Classes Left",
      cell: ({ row }) => {
        const classes = row.getValue("noOfClasses") as number
        return (
          <Chip 
            label={`${classes ?? 0} Classes`} 
            size="small" 
            sx={{ 
              bgcolor: classes < 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: classes < 5 ? '#f87171' : '#34d399',
              fontWeight: 600,
              borderRadius: 0
            }} 
          />
        )
      },
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-400">
          <GraduationCap size={14} />
          {row.getValue("grade")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const course = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-gray-400 rounded-none">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white backdrop-blur-md rounded-none">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(course.id)}
                className="cursor-pointer hover:bg-white/5"
              >
                Copy Course ID
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                onClick={() => router.push(`/teacher/courses/${course.id}`)}
                className="cursor-pointer text-indigo-400 hover:bg-indigo-400/10 focus:text-indigo-400 focus:bg-indigo-400/10"
              >
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/teachers-student')

        const contentType = response.headers.get('content-type');
        if (!response.ok) {
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch students');
          }
          throw new Error('Your session may have expired. Please log in again.');
        }
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

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 0, 
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
            My Courses
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Manage your active courses and track student progress.
          </Typography>
        </Box>

        <div className="flex items-center py-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students..."
              value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("studentName")?.setFilterValue(event.target.value)
              }
              className="pl-10 bg-white/5 text-white border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 placeholder:text-gray-500 rounded-none"
            />
          </div>
        </div>

        <div className="rounded-none border border-white/5 overflow-hidden bg-white/[0.01]">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-gray-400 font-medium py-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#6366f1' }} />
                      <span className="text-gray-500">Loading your courses...</span>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-red-400">
                    {error}
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-gray-500"
                  >
                    No courses found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-6">
          <div className="text-sm text-gray-500 font-medium">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-none"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-none"
            >
              Next
            </Button>
          </div>
        </div>
      </Box>
    </motion.div>
  )
}
