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
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export type Student = {
  id: string
  name: string
  email: string
  mobile: string,
  studentStatus: 'pending' | 'approved' | 'rejected'
}

export default function SignupStudentDataTable() {
  const router = useRouter()
  const [data, setData] = React.useState<Student[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isMigrating, setIsMigrating] = React.useState(false);

  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // const response = await fetch('/api/signup-std');
      const response = await fetch('/api/signup-std', { cache: 'no-store' });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch students');
      }
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
    if (!confirm("This will update all existing students without a status to 'pending'. This is a one-time operation. Are you sure?")) return;

    setIsMigrating(true);
    try {
      const response = await fetch('/api/migrate-student-status', {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Migration failed');
      toast.success(result.message, {
        description: `${result.updatedCount} student(s) updated. The list will now refresh.`,
      });
      fetchStudents(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "An error occurred during migration.");
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast.success(`Student status updated to ${newStatus}`);
      setData((prev) =>
        prev.map((student) => (student.id === id ? { ...student, studentStatus: newStatus } : student))
      );
      fetchStudents(); // Refetch data to ensure consistency
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    // Assuming a delete endpoint exists for students.
    // This might need to be adjusted based on actual API.
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "id",
      header: "Student ID",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "mobile",
      header: "Mobile No.",
    },
    {
      accessorKey: "studentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("studentStatus") as string;
        const color = 
          status === "approved" ? "text-green-400" :
          status === "rejected" ? "text-red-400" :
          "text-yellow-400";
        return <div className={`capitalize font-medium ${color}`}>{status || 'pending'}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-sm bg-popover/80">
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusUpdate(student.id, 'approved')}>
                Mark as Approved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(student.id, 'rejected')}>
                Mark as Rejected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(student.id, 'pending')}>
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(student.id)}
                className="text-red-500 focus:text-red-500 cursor-pointer"
              >Delete</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(student.id)}
                className="cursor-pointer data-[highlighted]:bg-transparent data-[highlighted]:text-purple-400"
              >
                Copy student ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/admin/students/${student.id}`)}
                className="cursor-pointer data-[highlighted]:bg-transparent data-[highlighted]:text-purple-400"
              >
                View student details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
          <CardTitle className="text-xl md:text-2xl">All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 md:py-4 gap-4">
            <Input
              placeholder="Filter by student name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Button onClick={handleMigration} disabled={isMigrating} variant="outline">
              {isMigrating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Migrating...</>
              ) : "Migrate Old Students"}
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
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
                    <TableCell colSpan={columns.length} className="h-20 md:h-24 text-center">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-20 md:h-24 text-center text-red-500">{error}</TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/50 even:bg-muted/20"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
                      className="h-20 md:h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 py-3 md:py-4">
            <div className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
              {table.getFilteredRowModel().rows.length} student(s) total
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