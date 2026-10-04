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
  Search, 
  ChevronLeft, 
  ChevronRight,
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
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { Box, Typography } from "@mui/material"

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

  // Automatically arrange data with the latest row first unless the user applies column sorting
  const sortedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (sorting.length > 0) return data;

    return [...data].sort((a: any, b: any) => {
      const dateA = a.createdAt || a.date || a.bookingDateAndTime || a.timestamp;
      const dateB = b.createdAt || b.date || b.bookingDateAndTime || b.timestamp;

      if (dateA && dateB) {
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
          return timeB - timeA; // Latest date first
        }
      }

      // Fallback to MongoDB ObjectId / id descending order (latest item first)
      const idA = a._id || a.id;
      const idB = b._id || b.id;

      if (idA && idB && typeof idA === 'string' && typeof idB === 'string') {
        return idB.localeCompare(idA);
      }

      return 0;
    });
  }, [data, sorting]);

  const table = useReactTable({
    data: sortedData,
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      {/* Integrated Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {icon && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 4, 
              bgcolor: 'rgba(99, 102, 241, 0.1)', 
              color: '#6366f1',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
              {React.cloneElement(icon as React.ReactElement, { size: 24 })}
            </Box>
          )}
          <Box>
            <Typography variant="h3" fontWeight="900" className="text-slate-900 dark:text-white" sx={{ tracking: '-0.02em', mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" className="text-slate-500 dark:text-slate-400" sx={{ fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {filterColumn && (
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <Input
              placeholder={filterPlaceholder}
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
              className="pl-12 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl h-14 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
            />
          </div>
        )}
      </Box>

      {/* Modern Integrated Table */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-sm dark:shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-[0.15em] py-4 px-4 md:px-6">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-slate-100 dark:border-slate-800/50">
                    {columns.filter(c => table.getColumn(c.id || (c as any).accessorKey)?.getIsVisible() !== false).map((_, j) => (
                      <TableCell key={`cell-${j}`} className="py-4 px-4 md:px-6">
                        <Skeleton className="h-10 w-full bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-80 text-center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#f87171', p: 4 }}>
                      <Typography variant="h5" fontWeight="bold">System Error</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>{error}</Typography>
                    </Box>
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
                      transition={{ delay: idx * 0.01 }}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 px-4 md:px-6">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-80 text-center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 4 }}>
                      <Search size={48} className="opacity-20 text-slate-400 dark:text-slate-500" />
                      <Typography variant="h6" className="text-slate-400 dark:text-slate-500">No matches found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Integrated Pagination */}
        <div className="p-4 px-8 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Typography variant="body2" className="text-slate-500 dark:text-slate-400" sx={{ fontWeight: 600 }}>
            Showing <span className="text-slate-900 dark:text-white font-bold">{table.getRowModel().rows.length}</span> of <span className="text-slate-900 dark:text-white font-bold">{data.length}</span> records
          </Typography>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-6 h-11 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all font-bold cursor-pointer"
            >
              <ChevronLeft size={18} className="mr-2" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-6 h-11 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all font-bold cursor-pointer"
            >
              Next <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
