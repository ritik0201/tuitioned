"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Users,
  UserCheck,
  BookOpen,
  IndianRupee,
  Bell,
  UserPlus,
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
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      gap: 3,
      borderRadius: 4,
      bgcolor: "#1f2937",
      border: "2px solid #374151",
    }}
  >
    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
    </Box>
  </Paper>
);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin-dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data.");
        }
        const result = await response.json();
        setData(result.data);
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!data) {
    return <Alert severity="info" sx={{ m: 4 }}>No dashboard data available.</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          mb: 4,
        }}
      >
        <StatCard title="Total Students" value={data.totalStudents} icon={<Users />} />
        <StatCard title="Total Teachers" value={data.totalTeachers} icon={<UserCheck />} />
        <StatCard title="Active Courses" value={data.activeCourses} icon={<BookOpen />} />
        <StatCard title="Pending Earnings" value={`₹${data.totalPendingEarnings.toFixed(2)}`} icon={<IndianRupee />} />
      </Box>

      {/* Recent Activity Sections */}
      <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <Box>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: "#1f2937", border: "2px solid #374151" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} gutterBottom>
              <Bell /> Recent Demo Requests
            </Typography>
            <List>
              {data.recentDemos.filter(demo => demo.studentId).map((demo, index) => (
                <React.Fragment key={demo._id}>
                  <Link href={`/admin/democlass-student/${demo.studentId._id}`}>
                    <ListItem>
                      <ListItemAvatar><Avatar sx={{ bgcolor: 'secondary.main' }}>{demo.studentId.fullName.charAt(0)}</Avatar></ListItemAvatar>
                      <ListItemText primary={demo.studentId.fullName} secondary={`Subject: ${demo.subject}`} />
                    </ListItem>
                  </Link>
                  {index < data.recentDemos.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
        <Box>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: "#1f2937", border: "2px solid #374151" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} gutterBottom>
              <UserPlus /> Recently Joined Students
            </Typography>
            <List>
              {data.recentStudents.map((student, index) => (
                <React.Fragment key={student._id}>
                  <Link href={`/admin/students/${student._id}`}>
                    <ListItem>
                      <ListItemAvatar><Avatar sx={{ bgcolor: 'success.main' }}>{student.fullName.charAt(0)}</Avatar></ListItemAvatar>
                      <ListItemText primary={student.fullName} secondary={`Joined: ${new Date(student.createdAt).toLocaleDateString()}`} />
                    </ListItem>
                  </Link>
                  {index < data.recentStudents.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}