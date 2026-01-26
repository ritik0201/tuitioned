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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  bookingDateAndTime: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  timeZone?: string;
}

export default function DemoClassStudentTable() {
  const router = useRouter()
  const [data, setData] = React.useState<DemoClassBooking[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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
      accessorKey: "bookingDateAndTime",
      header: "Booking Date",
      cell: ({ row }) => {
        const dateVal = row.getValue("bookingDateAndTime") as string;
        const timeZone = row.original.timeZone;
        return (
          <div className="flex flex-col">
            <span>
              {new Date(dateVal).toLocaleString(undefined, {
                timeZone,
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            {timeZone && <Badge variant="secondary" className="mt-1 font-normal">{timeZone}</Badge>}
          </div>
        );
      },
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
              {booking.status === 'confirmed' && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate(booking._id, 'completed')}
                  className="cursor-pointer"
                >
                  Mark as Completed
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">Demo Class Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-3 md:py-4">
            <Input
              placeholder="Filter by student name..."
              value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("studentName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm w-full"
            />
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
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
                    <TableCell colSpan={columns.length} className="h-20 md:h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-20 md:h-24 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50 even:bg-muted/20">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-20 md:h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 py-3 md:py-4">
            <div className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
              {table.getFilteredRowModel().rows.length} demo class(es) total
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="text-xs md:text-sm"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="text-xs md:text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}