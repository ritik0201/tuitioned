"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  Receipt, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  CreditCard,
  Calendar,
  User,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable } from "@/components/admin/DataTable";

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
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "paymentId",
      header: "Reference ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
           <div className="p-2 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-colors">
              <CreditCard size={14} />
           </div>
           <span className="font-mono text-xs text-gray-500 tracking-tight">{row.original.paymentId}</span>
        </div>
      )
    },
    {
      accessorKey: "studentName",
      header: ({ column }) => (
        <Button variant="ghost" className="hover:bg-white/5 p-0" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Payer Name <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 font-black text-xs">
              {row.original.studentName.charAt(0)}
           </div>
           <span className="font-bold text-white text-sm">{row.original.studentName}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Value",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-black text-white text-lg tracking-tighter">
           <span className="text-xs text-gray-500 font-normal">₹</span>
           {row.original.amount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Fulfillment",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = {
          completed: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <CheckCircle2 size={12} />, label: "Success" },
          failed: { color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: <XCircle size={12} />, label: "Failed" },
          pending: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: <Clock size={12} />, label: "Processing" },
        }[status] || { color: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: <Clock size={12} />, label: status };

        return (
          <Badge className={`${config.color} border flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex flex-col">
           <span className="text-xs text-gray-300 font-medium">{new Date(row.original.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
           <span className="text-[10px] text-gray-500">{new Date(row.original.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-600/10 hover:text-blue-500 transition-all rounded-lg">
           <ExternalLink size={16} />
        </Button>
      )
    }
  ]

  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/transaction')
        if (!response.ok) throw new Error('System error: Failed to retrieve ledger');
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

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <AdminDataTable
        columns={columns}
        data={data}
        title="Financial Ledger"
        subtitle="Global transaction history and payment processing records"
        icon={<Receipt size={28} />}
        filterColumn="studentName"
        filterPlaceholder="Search by payer name..."
        loading={loading}
        error={error}
        mobileHiddenColumns={["paymentId", "date"]}
      />
    </div>
  )
}