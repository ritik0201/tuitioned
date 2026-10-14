"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Box,
  CardHeader,
  Paper,
  Chip,
} from "@mui/material";
import { ArrowLeft, CreditCard, Download } from "lucide-react";
import { ITransaction } from "@/models/Transaction";
import Link from "next/link";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";

export default function TransactionHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.id as string;

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?courseId=${courseId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setTransactions(data.transactions || []);
        } else {
          throw new Error(data.message || "Failed to fetch transaction history.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [courseId]);

  const handleExport = () => {
    try {
      if (transactions.length === 0) {
        toast.error("No transactions to export.");
        return;
      }
      const count = exportToCsv({
        data: transactions,
        filename: `course_${courseId}_transactions_${new Date().toISOString().split('T')[0]}`,
        formatter: (tx: ITransaction) => ({
          "Transaction ID": tx.transactionId,
          "Classes Added": tx.numberOfClasses,
          "Amount (INR)": tx.amount,
          "Payment Status": (tx.paymentStatus || "pending").toUpperCase(),
          "Created Date": tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A",
        }),
      });
      toast.success(`Exported ${count} transaction records to CSV!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to export transactions.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: "1000px", mx: "auto", p: 3 }}>
      <Button
        component={Link}
        href={`/admin/students/${studentId}/${courseId}`}
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back to Course Details
      </Button>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardHeader 
          title="Full Transaction History" 
          subheader="All transactions for this course enrollment."
          action={
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download size={16} />}
              onClick={handleExport}
              disabled={transactions.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              Export CSV
            </Button>
          }
        />
        <Divider />
        <CardContent>
          {transactions.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {transactions.map((tx) => (
                <Paper key={tx._id.toString()} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {tx.numberOfClasses} {tx.numberOfClasses > 1 ? 'classes' : 'class'} added
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <CreditCard size={14} /> {tx.transactionId}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Chip
                      label={tx.paymentStatus.toUpperCase()}
                      size="small"
                      color={
                        tx.paymentStatus === 'completed' ? 'success' :
                        tx.paymentStatus === 'pending' ? 'warning' : 'error'
                      }
                      variant="outlined"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="body1" fontWeight="500">
                      ₹{tx.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(tx.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Alert severity="info" variant="outlined">
              No transactions found for this course.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}