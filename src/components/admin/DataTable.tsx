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
  Download,
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
import { exportToCsv } from "@/lib/exportCsv"
import { toast } from "sonner"

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
  exportFileName?: string
  exportFormatter?: (item: TData, index: number) => Record<string, any>
  enableExport?: boolean
  headerActions?: React.ReactNode
  onCustomExport?: (data: TData[]) => void
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
  mobileHiddenColumns = [],
  exportFileName,
  exportFormatter,
  enableExport = true,
  headerActions,
  onCustomExport,
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

  const isFiltered = React.useMemo(() => {
    return columnFilters.length > 0 && table.getFilteredRowModel().rows.length !== sortedData.length;
  }, [columnFilters, table, sortedData.length]);

  const filteredCount = table.getFilteredRowModel().rows.length;

  const handleExport = React.useCallback((exportAll: boolean = false) => {
    try {
      if (onCustomExport) {
        const records = exportAll
          ? sortedData
          : table.getFilteredRowModel().rows.map((r) => r.original);
        onCustomExport(records);
        return;
      }

      const recordsToExport = exportAll
        ? sortedData
        : (table.getFilteredRowModel().rows.map((r) => r.original) || sortedData);

      if (!recordsToExport || recordsToExport.length === 0) {
        toast.error("No records available to export.");
        return;
      }

      const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const todayStr = new Date().toISOString().split('T')[0];
      const targetFileName = exportFileName || `${cleanTitle}_${todayStr}`;

      const count = exportToCsv({
        data: recordsToExport,
        filename: targetFileName,
        formatter: exportFormatter,
      });

      toast.success(`Exported ${count} record${count === 1 ? '' : 's'} to CSV successfully!`);
    } catch (err: any) {
      console.error("Export CSV Error:", err);
      toast.error(err.message || "Failed to export data to CSV.");
    }
  }, [onCustomExport, sortedData, table, title, exportFileName, exportFormatter]);

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
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
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

          {headerActions}

          {enableExport && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExport(false)}
                disabled={loading || data.length === 0}
                className="h-14 px-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                title={isFiltered ? `Export ${filteredCount} filtered records to CSV` : `Export all ${data.length} records to CSV`}
              >
                <Download size={18} className="text-indigo-500" />
                <span>Export CSV</span>
                {isFiltered && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {filteredCount}
                  </span>
                )}
              </Button>

              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleExport(true)}
                  disabled={loading || data.length === 0}
                  className="h-14 px-3 rounded-2xl text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={`Export all ${data.length} records ignoring active filter`}
                >
                  Export All ({data.length})
                </Button>
              )}
            </div>
          )}
        </div>
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
