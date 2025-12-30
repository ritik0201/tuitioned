"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Button
} from '@mui/material';
import { Users, BookOpen, ClipboardList, ArrowRight, IndianRupee } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  totalStudents: number;
  activeCourses: number;
  totalEarnings: number;
  totalClasses: number;
  recentCourses: any[];
  recentActivity: any[];
}

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Paper
    elevation={0}
    className="border-2 border-blue-500"
    sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, borderRadius: 4, bgcolor: '#1f2937' }}
  >
    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>{icon}</Avatar>
    <Box>
      <Typography variant="h4" fontWeight="bold">{value}</Typography>
      <Typography variant="body1" color="text.secondary">{title}</Typography>
    </Box>
  </Paper>
);

const TeacherDashboardPage = () => {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/teacher-dashboard');
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch dashboard data.');
        }
        setDashboardData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!dashboardData) {
    return <Alert severity="info" sx={{ m: 4 }}>No dashboard data available.</Alert>;
  }

  const { totalStudents, activeCourses, totalClasses, totalEarnings = 0, recentCourses, recentActivity } = dashboardData;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {session?.user?.fullName?.split(' ')[0]}!
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        Here&apos;s a summary of your teaching activity.
      </Typography>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
        <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', lg: '25%' } }}>
          <StatCard title="Total Students" value={totalStudents} icon={<Users />} />
        </Box>
        <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', lg: '25%' } }}>
          <StatCard title="Active Courses" value={activeCourses} icon={<BookOpen />} />
        </Box>
        <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', lg: '25%' } }}>
          <StatCard title="Total Classes Left" value={totalClasses} icon={<ClipboardList />} />
        </Box>
        <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', lg: '25%' } }}>
          <StatCard title="Pending Earnings" value={`₹${totalEarnings.toFixed(2)}`} icon={<IndianRupee />} />
        </Box>
      </Box>

      {/* Recent Activity & Courses */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
        <Box sx={{ p: 2, width: { xs: '100%', lg: '50%' } }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937', height: '100%' }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Courses</Typography>
            <List disablePadding>
              {recentCourses.length > 0 ? recentCourses.map((course, index) => (
                <React.Fragment key={course._id}>
                  <ListItem
                    secondaryAction={
                      <Button
                        component={Link}
                        href={`/teacher/courses/${course._id}`}
                        endIcon={<ArrowRight size={16} />}
                        size="small"
                      >
                        View
                      </Button>
                    }
                    disablePadding
                  >
                    <ListItemText
                      primary={course.title}
                      secondary={`Student: ${course.studentId.fullName} - ${course.noOfClasses} classes left`}
                    />
                  </ListItem>
                  {index < recentCourses.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                </React.Fragment>
              )) : <Typography color="text.secondary">No recent course updates.</Typography>}
            </List>
          </Paper>
        </Box>

        <Box sx={{ p: 2, width: { xs: '100%', lg: '50%' } }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937', height: '100%' }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>Recent Activity</Typography>
            <List disablePadding>
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <ClipboardList size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`Completed: ${activity.topic}`}
                      secondary={`With ${activity.studentId.fullName} on ${new Date(activity.completedAt).toLocaleDateString()}`}
                    />
                    <Chip label={activity.duration ? `${(activity.duration / 60).toFixed(1).replace(/\.0$/, '')} hours` : 'N/A'} size="small" />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider component="li" sx={{ my: 1.5 }} />}
                </React.Fragment>
              )) : <Typography color="text.secondary">No recent class completions.</Typography>}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TeacherDashboardPage;