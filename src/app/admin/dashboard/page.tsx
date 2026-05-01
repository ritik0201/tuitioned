"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  UserCheck,
  BookOpen,
  Bell,
  UserPlus,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Zap,
  Target
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Box, IconButton } from "@mui/material";

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  totalPendingEarnings: number;
  recentDemos: {
    _id: string;
    subject: string;
    studentId: { _id: string; fullName: string; email: string; profileImage?: string };
  }[];
  recentStudents: {
    _id: string;
    fullName: string;
    email: string;
    createdAt: string;
    profileImage?: string;
  }[];
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = "from-blue-600 to-blue-700",
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group"
  >
    <Card className={`relative overflow-hidden border-0 shadow-2xl transition-all duration-500 hover:scale-[1.03] group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-90 group-hover:opacity-100 transition-opacity`} />
      <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform">
         {React.cloneElement(icon as React.ReactElement, { size: 120 })}
      </div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-bold tracking-wider uppercase text-white/80">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-md shadow-lg border border-white/20">{icon}</div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-1">{value}</div>
        {trend && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold text-white uppercase">
               {trend}
            </div>
            <ArrowUpRight className="h-3 w-3 text-white/70" />
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default function AdminDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTeachers, setPendingTeachers] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/admin/login");
      return;
    }
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, pendingTeachersRes, transactionsRes] = await Promise.all([
          fetch("/api/admin-dashboard"),
          fetch("/api/teachers?status=pending"),
          fetch("/api/transaction"),
        ]);

        if (!dashboardRes.ok) throw new Error("Failed to fetch dashboard data.");
        const dashboardData = await dashboardRes.json();

        const pendingTeachersData = await pendingTeachersRes.json();
        setPendingTeachers(Array.isArray(pendingTeachersData) ? pendingTeachersData.length : 0);

        const transactionsData = await transactionsRes.json();
        const totalEarned = Array.isArray(transactionsData)
          ? transactionsData
              .filter((tx: any) => tx.status === 'completed')
              .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0)
          : 0;
        setTotalEarnings(totalEarned);

        setData(dashboardData.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="p-8 space-y-8">
         <Skeleton className="h-12 w-64 bg-white/5" />
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl bg-white/5" />)}
         </div>
      </div>
    );
  }

  if (error) return <Alert variant="destructive" className="m-8"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!data) return <Alert className="m-8"><AlertDescription>No dashboard data available.</AlertDescription></Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 mb-10 bg-[#111827] border border-white/5 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-1">Admin Central</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
            System <span className="text-blue-500">Overview</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Welcome back! You have <span className="text-white font-bold">{pendingTeachers} pending teacher approvals</span> and <span className="text-white font-bold">{data.recentDemos.length} new demo requests</span> waiting for review.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
             <Button onClick={() => router.push('/admin/teachers')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-blue-600/20">
                Review Teachers
             </Button>
             <Button variant="outline" onClick={() => router.push('/admin/mail')} className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 h-12 font-bold">
                Send Bulk Mail
             </Button>
          </div>
        </div>
      </motion.div>

      {/* Modern Stat Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-12">
        <StatCard title="Total Students" value={data.totalStudents} icon={<Users size={24} />} trend="+12% grow" color="from-blue-600 to-blue-800" delay={0.1} />
        <StatCard title="Total Teachers" value={data.totalTeachers} icon={<UserCheck size={24} />} trend="+5% new" color="from-emerald-500 to-teal-700" delay={0.2} />
        <StatCard title="Active Courses" value={data.activeCourses} icon={<BookOpen size={24} />} trend="Stable" color="from-indigo-600 to-purple-800" delay={0.3} />
        <StatCard title="Pending Review" value={pendingTeachers} icon={<ShieldCheck size={24} />} trend="Priority" color="from-orange-500 to-rose-600" delay={0.4} />
        <StatCard title="Platform Revenue" value={`₹${totalEarnings}`} icon={<DollarSign size={24} />} trend="Top performing" color="from-amber-500 to-orange-600" delay={0.5} />
        <StatCard title="Unpaid Balance" value={`₹${data.totalPendingEarnings}`} icon={<TrendingUp size={24} />} trend="Action required" color="from-rose-600 to-pink-800" delay={0.6} />
      </div>

      <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
        {/* Recent Demos List - Premium Version */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="xl:col-span-2">
          <Card className="bg-[#111827] border-white/5 text-white rounded-[2rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                   <Zap className="text-yellow-500" fill="currentColor" />
                   Recent Demo Requests
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">Direct inquiries from prospective students</p>
              </div>
              <Link href="/admin/democlass-student">
                <Button variant="ghost" className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                {data.recentDemos.filter(demo => demo.studentId).slice(0, 5).map((demo) => (
                  <div key={demo._id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                        <AvatarImage src={demo.studentId.profileImage} />
                        <AvatarFallback className="bg-blue-500 text-white font-bold">{demo.studentId.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg">{demo.studentId.fullName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-gray-400">{demo.subject}</Badge>
                           <span className="text-xs text-gray-600">•</span>
                           <span className="text-xs text-gray-500">{demo.studentId.email}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/admin/democlass-student/${demo._id}`}>
                       <IconButton className="bg-white/5 hover:bg-blue-600 hover:text-white transition-all">
                          <ArrowUpRight size={20} />
                       </IconButton>
                    </Link>
                  </div>
                ))}
                {data.recentDemos.length === 0 && (
                  <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                     <Activity size={48} className="mb-4 opacity-20" />
                     <p>No recent demo requests found.</p>
                  </div>
                )}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Joined Students - Premium Version */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
          <Card className="bg-[#111827] border-white/5 text-white rounded-[2rem] overflow-hidden shadow-2xl h-full">
            <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                   <Target className="text-emerald-500" />
                   New Students
                </CardTitle>
                <p className="text-gray-500 text-sm mt-1">Latest members to join the platform</p>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                {data.recentStudents.slice(0, 6).map((student) => (
                  <div key={student._id} className="p-6 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white/10">
                      <AvatarImage src={student.profileImage} />
                      <AvatarFallback className="bg-emerald-500 text-white font-bold">{student.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{student.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate">{new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <Link href={`/admin/students/${student._id}`}>
                       <Button size="sm" variant="outline" className="rounded-full border-white/10 hover:bg-blue-600 hover:border-blue-600 hover:text-white">Profile</Button>
                    </Link>
                  </div>
                ))}
               </div>
               <div className="p-6">
                  <Button variant="outline" onClick={() => router.push('/admin/students')} className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-xl py-6">
                     Browse All Students
                  </Button>
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Box>
  );
}