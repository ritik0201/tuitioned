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
import { ArrowUpDown, Calendar, Video, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Paper, Typography, Chip } from "@mui/material"

// Define the shape of the data based on the API response
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
          >
            Student Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.original.studentId?.fullName || "N/A"}</div>,
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "bookingDateAndTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{date.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {status === 'confirmed' || status === 'completed'
                  ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : "Time Pending"}
              </span>
            </div>
            {timeZone && <div className="text-xs text-muted-foreground">({timeZone})</div>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        let color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" = "default"
        
        // Map status to MUI Chip colors
        const normalizedStatus = status?.toLowerCase() || 'pending';
        if (normalizedStatus === 'confirmed') color = "success";
        else if (normalizedStatus === 'pending') color = "warning";
        else if (normalizedStatus === 'completed') color = "info";
        else if (normalizedStatus === 'cancelled') color = "error";

        return <Chip label={status || "Pending"} color={color} size="small" variant="outlined" />
      },
    },
    {
      id: "join",
      header: "Join Class",
      cell: ({ row }) => {
        const joinLink = row.original.joinLink
        return (
          <Button
            variant="ghost"
            className="cursor-pointer"
            size="sm"
            disabled={!joinLink}
            onClick={() => joinLink && window.open(joinLink, "_blank")}
          >
            <Video className="mr-2 h-4 w-4" /> Join
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
    <Paper
      elevation={0}
      className="border-2 border-blue-500"
      sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#1f2937' }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
        Assigned Demo Classes
      </Typography>
      
      <div className="rounded-md border border-gray-700 mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-300">
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-300">
                  Loading demo classes...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300">
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
                  className="h-24 text-center text-gray-400"
                >
                  No assigned demo classes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="text-black dark:text-white"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="text-black dark:text-white"
        >
          Next
        </Button>
      </div>
    </Paper>
  )
}