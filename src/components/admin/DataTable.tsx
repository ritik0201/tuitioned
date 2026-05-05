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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      {/* Integrated Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, justifyContent: 'space-between', gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {icon && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 4, 
              bgcolor: 'rgba(99, 102, 241, 0.1)', 
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
              {React.cloneElement(icon as React.ReactElement, { size: 24 })}
            </Box>
          )}
          <Box>
            <Typography variant="h3" fontWeight="900" sx={{ color: 'white', tracking: '-0.02em', mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {filterColumn && (
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <Input
              placeholder={filterPlaceholder}
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
              className="pl-12 w-full bg-white/5 border-white/10 text-white rounded-2xl h-14 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base placeholder:text-gray-600"
            />
          </div>
        )}
      </Box>

      {/* Modern Integrated Table */}
      <Box sx={{ 
        borderRadius: 6, 
        overflow: 'hidden', 
        bgcolor: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-white/[0.03]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-white/5 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-400 font-bold uppercase text-[11px] tracking-[0.15em] py-6 px-8">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-white/5">
                    {columns.filter(c => table.getColumn(c.id || (c as any).accessorKey)?.getIsVisible() !== false).map((_, j) => (
                      <TableCell key={`cell-${j}`} className="py-8 px-8">
                        <Skeleton className="h-10 w-full bg-white/5 rounded-2xl" />
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
                      className="border-b border-white/5 hover:bg-white/[0.04] transition-all group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-6 px-8">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-80 text-center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textSecondary: 'gray.600', p: 4 }}>
                      <Search size={48} className="opacity-10 text-white" />
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>No matches found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Integrated Pagination */}
        <Box sx={{ 
          p: 4, 
          px: 8,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 4, 
          bg: 'rgba(255, 255, 255, 0.01)' 
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
            Showing <span className="text-white">{table.getRowModel().rows.length}</span> of <span className="text-white">{data.length}</span> records
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, w: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white rounded-xl px-6 h-11 hover:bg-white/10 hover:border-white/20 disabled:opacity-20 transition-all font-bold"
            >
              <ChevronLeft size={18} className="mr-2" /> Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="flex-1 sm:flex-none bg-white/5 border-white/10 text-white rounded-xl px-6 h-11 hover:bg-white/10 hover:border-white/20 disabled:opacity-20 transition-all font-bold"
            >
              Next <ChevronRight size={18} className="ml-2" />
            </Button>
          </Box>
        </Box>
      </Box>
    </motion.div>
  )
}
