"use client"

import * as React from "react"
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
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export type Transaction = {
  id: string;
  studentName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentId: string;
  date: string;
}

export default function TransactionDataTable() {
  const [data, setData] = React.useState<Transaction[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "paymentId",
      header: "Payment ID",
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("studentName")}</div>,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => `₹${row.getValue("amount")}`,
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleString(),
    },
  ]

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/transaction')
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const transactions = await response.json()
        setData(transactions)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
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
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">Transactions</CardTitle>
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
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-20 md:h-24 text-center">Loading transactions...</TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={columns.length} className="h-20 md:h-24 text-center text-red-500">{error}</TableCell></TableRow>
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
                  <TableRow><TableCell colSpan={columns.length} className="h-20 md:h-24 text-center">No transactions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4 py-3 md:py-4">
            <div className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
              {table.getFilteredRowModel().rows.length} transaction(s) total
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="text-xs md:text-sm">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="text-xs md:text-sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}