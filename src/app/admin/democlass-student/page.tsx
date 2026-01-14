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
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Paper, Typography } from "@mui/material"
import { toast } from "sonner"

export type DemoClassBooking = {
  _id: string
  studentName?: string // Make studentName optional
  studentId: {
    _id: string
    email: string
    fullName?: string // Add fullName from populated User
  }
  topic: string
  subject: string
  date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

export default function DemoClassStudentTable() {
  const router = useRouter()
  const [data, setData] = React.useState<DemoClassBooking[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleStatusUpdate = async (id: string, newStatus: DemoClassBooking['status']) => {
    try {
      const response = await fetch('/api/demoClass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update status.');
      }

      toast.success(`Status updated to ${newStatus}.`);
      // Update the local data to reflect the change immediately
      setData(prevData =>
        prevData.map(booking => booking._id === id ? { ...booking, status: newStatus } : booking)
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this demo class? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/demoClass/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete demo class");

      setData((prev) => prev.filter((booking) => booking._id !== id));
      toast.success("Demo class deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete demo class");
    }
  };

  const columns: ColumnDef<DemoClassBooking>[] = [
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "studentName",
      accessorFn: (row) => row.studentName || row.studentId?.fullName,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <div>{row.getValue("studentName") || "N/A"}</div>
      },
    },
    {
      accessorKey: "studentId._id",
      header: "Student ID",
      cell: ({ row }) => row.original.studentId?._id ?? "N/A",
    },
    {
      accessorKey: "studentId.email",
      header: "Email",
      cell: ({ row }) => row.original.studentId?.email ?? "N/A",
    },
    {
      accessorKey: "topic",
      header: "Demo Class Topic",
    },
    {
      accessorKey: "date",
      header: "Booking Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const booking = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/80">
              <DropdownMenuItem 
                onClick={() => handleDelete(booking._id)}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >Delete</DropdownMenuItem>
              {booking.status === 'pending' && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                  className="cursor-pointer"
                >
                  Confirm Booking
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => booking.studentId?._id && navigator.clipboard.writeText(booking.studentId._id)}
              >
                Copy student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => booking.studentId?._id && router.push(`/admin/students/${booking.studentId._id}`)}
              >
                View student details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/democlass-student/${booking._id}`)}
              >
                View booking details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  React.useEffect(() => {
    const fetchDemoBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/demoClass')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to fetch demo class students')
        }
        const bookings = await response.json()
        setData(bookings)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDemoBookings()
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
    <Paper
      elevation={0}
      className="border-2 border-blue-500"
      sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: '#1f2937' }}
    >
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Demo Class Students</Typography>
      <div className="flex items-center py-2 md:py-4">
        <Input
          placeholder="Filter by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm w-full bg-gray-700 text-white border-gray-600 placeholder:text-gray-400"
        />
      </div>
      <div className="rounded-md border border-gray-700 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={["studentId._id", "studentId.email", "date"].includes(header.column.id) ? "hidden md:table-cell" : ""}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={["studentId._id", "studentId.email", "date"].includes(cell.column.id) ? "hidden md:table-cell" : ""}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 md:py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </Paper>
  )
}