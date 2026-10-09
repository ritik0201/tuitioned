"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
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
import { Users, BookOpen, ClipboardList, ArrowRight, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardData {
  totalStudents: number;
  activeCourses: number;
  totalEarnings: number;
  totalClasses: number;
  recentCourses: any[];
  recentActivity: any[];
}

const StatCard = ({ title, value, icon, color, delay }: { title: string; value: string | number; icon: React.ReactNode; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="h-full"
  >
    <Box
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: color,
          boxShadow: `0 10px 25px -5px ${color}33`,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: `${color}18`, 
            color: color,
            width: 48, 
            height: 48,
            border: `1px solid ${color}33`
          }}
        >
          {icon}
        </Avatar>
        <TrendingUp size={20} style={{ opacity: 0.5, color }} />
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          {title}
        </Typography>
      </Box>
    </Box>
  </motion.div>
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
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: 2 }}>No dashboard data available.</Alert>
      </Box>
    );
  }

  const { totalStudents, activeCourses, totalClasses, totalEarnings = 0, recentCourses, recentActivity } = dashboardData;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '1600px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
          Welcome back, {session?.user?.fullName?.split(' ')[0]}!
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400 }}>
          Here's what's happening with your classes today.
        </Typography>
      </motion.div>

      {/* Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 5 }}>
        <StatCard title="Total Students" value={totalStudents} icon={<Users size={24} />} color="#4f46e5" delay={0.1} />
        <StatCard title="Active Courses" value={activeCourses} icon={<BookOpen size={24} />} color="#10b981" delay={0.2} />
        <StatCard title="Classes Left" value={totalClasses} icon={<ClipboardList size={24} />} color="#f59e0b" delay={0.3} />
        <StatCard title="Pending Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon={<IndianRupee size={24} />} color="#ec4899" delay={0.4} />
      </Box>

      {/* Recent Activity & Courses */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Box
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              bgcolor: 'background.paper', 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              height: '100%' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>Recent Courses</Typography>
              <Button 
                component={Link} 
                href="/teacher/courses" 
                size="small" 
                sx={{ color: 'primary.main', textTransform: 'none', fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>
            <List disablePadding>
              {recentCourses.length > 0 ? recentCourses.map((course, index) => (
                <React.Fragment key={course._id}>
                  <ListItem
                    sx={{ 
                      px: 0, 
                      py: 2,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateX(4px)' }
                    }}
                    secondaryAction={
                      <Button
                        component={Link}
                        href={`/teacher/courses/${course._id}`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderRadius: 2, 
                          borderColor: 'divider', 
                          color: 'text.primary',
                          minWidth: 'auto',
                          px: 2,
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                      >
                        <ArrowRight size={18} />
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', borderRadius: 2 }}>
                        <BookOpen size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={600} sx={{ color: 'text.primary' }}>{course.title}</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Student: <span className="font-medium text-foreground">{course.studentId?.fullName || 'N/A'}</span> • {course.noOfClasses} classes left
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentCourses.length - 1 && <Divider sx={{ borderColor: 'divider' }} />}
                </React.Fragment>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'text.secondary' }}>No recent course updates.</Typography>
                </Box>
              )}
            </List>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Box
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              bgcolor: 'background.paper', 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              height: '100%' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>Recent Activity</Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'action.hover', color: 'text.secondary' }}>
                <Calendar size={16} />
              </Avatar>
            </Box>
            <List disablePadding>
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: 2 }}>
                        <ClipboardList size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={600} sx={{ color: 'text.primary' }}>{activity.topic}</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          With {activity.studentId?.fullName || 'N/A'} • {new Date(activity.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={activity.duration ? `${(activity.duration / 60).toFixed(1).replace(/\.0$/, '')}h` : 'N/A'} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'action.hover', 
                        color: 'text.primary',
                        fontWeight: 600,
                        borderRadius: 1.5
                      }} 
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider sx={{ borderColor: 'divider' }} />}
                </React.Fragment>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'text.secondary' }}>No recent class completions.</Typography>
                </Box>
              )}
            </List>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default TeacherDashboardPage;