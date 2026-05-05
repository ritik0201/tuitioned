"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Calendar, Video, Clock, User, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
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

export type DemoClass = {
  _id: string
  studentId: {
    _id: string
    fullName: string
    email: string
    mobile: string
  }
  subject: string
  bookingDateAndTime: string
  status: string
  joinLink?: string
  timeZone?: string
}

export default function AssignedDemoClassesPage() {
  const [data, setData] = React.useState<DemoClass[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const columns: ColumnDef<DemoClass>[] = [
    {
      accessorKey: "studentId.fullName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/5 text-gray-300"
          >
            Student Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', fontSize: '0.875rem' }}>
            <User size={16} />
          </Avatar>
          <span className="font-semibold text-white">{row.original.studentId?.fullName || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-300">
          <BookOpen size={14} className="text-pink-400" />
          {row.getValue("subject")}
        </div>
      ),
    },
    {
      accessorKey: "bookingDateAndTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-white/5 text-gray-300"
          >
            Date & Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dateVal = row.getValue("bookingDateAndTime") as string;
        const date = new Date(dateVal);
        const timeZone = row.original.timeZone;
        const status = row.original.status?.toLowerCase();

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-sm">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-sm font-medium">
                {status === 'confirmed' || status === 'completed'
                  ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "Time Pending"}
              </span>
              {timeZone && <span className="text-[10px] text-gray-500 uppercase">({timeZone})</span>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const normalizedStatus = status?.toLowerCase() || 'pending';
        
        let bgColor = 'rgba(156, 163, 175, 0.1)';
        let textColor = '#9ca3af';

        if (normalizedStatus === 'confirmed') { bgColor = 'rgba(16, 185, 129, 0.1)'; textColor = '#34d399'; }
        else if (normalizedStatus === 'pending') { bgColor = 'rgba(245, 158, 11, 0.1)'; textColor = '#fbbf24'; }
        else if (normalizedStatus === 'completed') { bgColor = 'rgba(59, 130, 246, 0.1)'; textColor = '#60a5fa'; }
        else if (normalizedStatus === 'cancelled') { bgColor = 'rgba(239, 68, 68, 0.1)'; textColor = '#f87171'; }

        return (
          <Chip 
            label={status || "Pending"} 
            size="small" 
            sx={{ 
              bgcolor: bgColor,
              color: textColor,
              fontWeight: 600,
              borderRadius: 1.5,
              textTransform: 'capitalize'
            }} 
          />
        )
      },
    },
    {
      id: "join",
      header: "Action",
      cell: ({ row }) => {
        const joinLink = row.original.joinLink
        return (
          <Button
            variant="default"
            size="sm"
            disabled={!joinLink}
            onClick={() => joinLink && window.open(joinLink, "_blank")}
            className="bg-pink-600 hover:bg-pink-700 text-white border-none rounded-lg h-9 px-4 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
          >
            <Video className="mr-2 h-4 w-4" /> Join Now
          </Button>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchDemoClasses = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/demo-classes-assign')
        if (!response.ok) {
          throw new Error('Failed to fetch demo classes')
        }
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDemoClasses()
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
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
          borderRadius: 4, 
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 1 }}>
            Assigned Demo Classes
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Your upcoming trial sessions with potential students.
          </Typography>
        </Box>
        
        <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01] mt-4">
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
                  <TableCell colSpan={columns.length} className="h-40 text-center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} sx={{ color: '#ec4899' }} />
                      <span className="text-gray-500 font-medium">Loading assigned classes...</span>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center text-red-400 font-medium">
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
                    className="h-40 text-center text-gray-500 font-medium"
                  >
                    No assigned demo classes found at the moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-end space-x-2 py-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-lg"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 rounded-lg"
          >
            Next
          </Button>
        </div>
      </Box>
    </motion.div>
  )
}