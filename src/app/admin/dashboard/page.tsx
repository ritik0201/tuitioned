"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  totalPendingEarnings: number;
  recentDemos: {
    _id: string;
    subject: string;
    studentId: { _id: string; fullName: string; email: string };
  }[];
  recentStudents: {
    _id: string;
    fullName: string;
    email: string;
    createdAt: string;
  }[];
}

const StatCard = ({
  title,
  value,
  icon,
  trend,
  color = "bg-card",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}) => (
  <Card className={`relative overflow-hidden ${color}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs md:text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-lg md:text-2xl font-bold">{value}</div>
      {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingTeachers, setPendingTeachers] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <Alert className="m-4"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (!data) {
    return <Alert className="m-4"><AlertDescription>No dashboard data available.</AlertDescription></Alert>;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6 md:space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Total Students" value={data.totalStudents} icon={<Users className="h-4 w-4" />} color="bg-blue-50 dark:bg-blue-950" />
        <StatCard title="Total Teachers" value={data.totalTeachers} icon={<UserCheck className="h-4 w-4" />} color="bg-green-50 dark:bg-green-950" />
        <StatCard title="Active Courses" value={data.activeCourses} icon={<BookOpen className="h-4 w-4" />} color="bg-purple-50 dark:bg-purple-950" />
        <StatCard title="Pending Teachers" value={pendingTeachers} icon={<Clock className="h-4 w-4" />} color="bg-orange-50 dark:bg-orange-950" />
        <StatCard title="Total Earnings" value={`₹${totalEarnings}`} icon={<DollarSign className="h-4 w-4" />} color="bg-yellow-50 dark:bg-yellow-950" />
        <StatCard title="Pending Earnings" value={`₹${data.totalPendingEarnings}`} icon={<TrendingUp className="h-4 w-4" />} color="bg-red-50 dark:bg-red-950" />
      </div>

      {/* Recent Activity Sections */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              Recent Demo Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {data.recentDemos.filter(demo => demo.studentId).map((demo) => (
              <div key={demo._id} className="flex items-center space-x-3 md:space-x-4">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="text-xs">{demo.studentId.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{demo.studentId.fullName}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Subject: {demo.subject}</p>
                </div>
                <Link href={`/admin/democlass-student/${demo._id}`}>
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                    View
                  </Button>
                </Link>
              </div>
            ))}
            {data.recentDemos.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent demo requests.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
              Recently Joined Students
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {data.recentStudents.map((student) => (
              <div key={student._id} className="flex items-center space-x-3 md:space-x-4">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarFallback className="text-xs">{student.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium leading-none truncate">{student.fullName}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/admin/students/${student._id}`}>
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7">
                    View
                  </Button>
                </Link>
              </div>
            ))}
            {data.recentStudents.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent students.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/admin/teachers">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                Manage Teachers
              </Button>
            </Link>
            <Link href="/admin/students">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                Manage Students
              </Button>
            </Link>
            <Link href="/admin/approved-teacher">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                Approved Teachers
              </Button>
            </Link>
            <Link href="/admin/transaction">
              <Button variant="outline" size="sm" className="text-xs md:text-sm">
                View Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}