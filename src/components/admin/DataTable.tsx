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
  VisibilityState,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title: string
  subtitle?: string
  icon?: React.ReactNode
  filterColumn?: string
  filterPlaceholder?: string
  loading?: boolean
  error?: string | null
  mobileHiddenColumns?: string[] // Columns to hide on small screens
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  title,
  subtitle,
  icon,
  filterColumn,
  filterPlaceholder = "Search...",
  loading,
  error,
  mobileHiddenColumns = []
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // Handle mobile responsiveness for columns
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const visibility: VisibilityState = {};
      
      if (isMobile && mobileHiddenColumns.length > 0) {
        mobileHiddenColumns.forEach(col => {
          visibility[col] = false;
        });
      }
      
      setColumnVisibility(visibility);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileHiddenColumns]);

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <Card className="bg-[#111827] border-white/5 shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-5 md:p-10 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 md:gap-5">
              {icon && (
                <div className="p-2.5 md:p-4 rounded-xl md:rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-inner">
                   {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                </div>
              )}
              <div>
                <CardTitle className="text-xl md:text-3xl font-black text-white tracking-tight">{title}</CardTitle>
                {subtitle && <p className="text-gray-500 text-[10px] md:text-sm mt-0.5 md:mt-1 font-medium line-clamp-1">{subtitle}</p>}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {filterColumn && (
                <div className="relative group w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <Input
                    placeholder={filterPlaceholder}
                    value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
                    className="pl-9 w-full sm:w-[250px] md:w-[300px] bg-white/5 border-white/10 text-white rounded-xl md:rounded-2xl h-10 md:h-12 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto scrollbar-hide">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-white/5 hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-gray-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] py-4 md:py-6 px-4 md:px-8">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`} className="border-b border-white/5">
                      {columns.filter(c => table.getColumn(c.id || (c as any).accessorKey)?.getIsVisible() !== false).map((_, j) => (
                        <TableCell key={`cell-${j}`} className="py-4 md:py-8 px-4 md:px-8">
                          <Skeleton className="h-8 md:h-10 w-full bg-white/5 rounded-xl md:rounded-2xl" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-40 md:h-60 text-center">
                       <div className="flex flex-col items-center gap-2 text-red-400 p-4">
                          <span className="text-base md:text-lg font-bold">Error loading data</span>
                          <span className="text-xs md:text-sm opacity-70">{error}</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows.map((row, idx) => (
                      <motion.tr
                        key={row.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-all group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-4 md:py-6 px-4 md:px-8">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-40 md:h-60 text-center">
                       <div className="flex flex-col items-center gap-3 text-gray-600 p-4">
                          <Search size={32} className="opacity-20" />
                          <span className="text-base md:text-lg font-medium">No records found</span>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-5 md:p-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 md:gap-6 bg-white/[0.01]">
            <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-sm text-gray-500 font-semibold bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5">
              Showing <span className="text-white">{table.getRowModel().rows.length}</span> of <span className="text-white">{data.length}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => table.previousPage()} 
                 disabled={!table.getCanPreviousPage()}
                 className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white rounded-xl px-4 md:px-6 h-9 md:h-11 hover:bg-white/10 hover:border-white/20 disabled:opacity-20 transition-all font-bold text-xs md:text-sm"
              >
                <ChevronLeft size={16} className="mr-1 md:mr-2" /> Prev
              </Button>
              <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => table.nextPage()} 
                 disabled={!table.getCanNextPage()}
                 className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white rounded-xl px-4 md:px-6 h-9 md:h-11 hover:bg-white/10 hover:border-white/20 disabled:opacity-20 transition-all font-bold text-xs md:text-sm"
              >
                Next <ChevronRight size={16} className="ml-1 md:ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
