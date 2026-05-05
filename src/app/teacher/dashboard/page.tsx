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
    transition={{ duration: 0.5, delay }}
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
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: color,
          boxShadow: `0 10px 30px -10px ${color}44`,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Avatar 
          sx={{ 
            bgcolor: `${color}22`, 
            color: color,
            width: 48, 
            height: 48,
            border: `1px solid ${color}44`
          }}
        >
          {icon}
        </Avatar>
        <TrendingUp size={20} className="text-gray-500 opacity-50" />
      </Box>
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>{value}</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
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
        <CircularProgress sx={{ color: '#6366f1' }} />
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
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" fontWeight="bold" sx={{ 
          color: 'white', 
          mb: 1,
          background: 'linear-gradient(to right, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Welcome back, {session?.user?.fullName?.split(' ')[0]}!
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 5, fontWeight: 400 }}>
          Here's what's happening with your classes today.
        </Typography>
      </motion.div>

      {/* Stat Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
        <StatCard title="Total Students" value={totalStudents} icon={<Users size={24} />} color="#6366f1" delay={0.1} />
        <StatCard title="Active Courses" value={activeCourses} icon={<BookOpen size={24} />} color="#10b981" delay={0.2} />
        <StatCard title="Classes Left" value={totalClasses} icon={<ClipboardList size={24} />} color="#f59e0b" delay={0.3} />
        <StatCard title="Pending Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon={<IndianRupee size={24} />} color="#ec4899" delay={0.4} />
      </Box>

      {/* Recent Activity & Courses */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Box
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>Recent Courses</Typography>
              <Button 
                component={Link} 
                href="/teacher/courses" 
                size="small" 
                sx={{ color: '#6366f1', textTransform: 'none', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}
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
                      '&:hover': { transform: 'translateX(5px)' }
                    }}
                    secondaryAction={
                      <Button
                        component={Link}
                        href={`/teacher/courses/${course._id}`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          borderRadius: 2, 
                          borderColor: 'rgba(255, 255, 255, 0.1)', 
                          color: 'white',
                          minWidth: 'auto',
                          px: 2,
                          '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.1)' }
                        }}
                      >
                        <ArrowRight size={18} />
                      </Button>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: 2 }}>
                        <BookOpen size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={600} sx={{ color: 'white' }}>{course.title}</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Student: <span className="text-gray-300">{course.studentId.fullName}</span> • {course.noOfClasses} classes left
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentCourses.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                </React.Fragment>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>No recent course updates.</Typography>
                </Box>
              )}
            </List>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Box
            sx={{ 
              p: 3, 
              borderRadius: 4, 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              height: '100%' 
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>Recent Activity</Typography>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'gray' }}>
                <Calendar size={16} />
              </Avatar>
            </Box>
            <List disablePadding>
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 2 }}>
                        <ClipboardList size={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography fontWeight={600} sx={{ color: 'white' }}>{activity.topic}</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          With {activity.studentId.fullName} • {new Date(activity.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Typography>
                      }
                    />
                    <Chip 
                      label={activity.duration ? `${(activity.duration / 60).toFixed(1).replace(/\.0$/, '')}h` : 'N/A'} 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.05)', 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 500,
                        borderRadius: 1.5
                      }} 
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                </React.Fragment>
              )) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>No recent class completions.</Typography>
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