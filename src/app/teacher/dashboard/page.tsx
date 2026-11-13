"use client";

import React, { useEffect, useState, useRef } from 'react';
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
import {
  Users,
  BookOpen,
  ClipboardList,
  ArrowRight,
  IndianRupee,
  TrendingUp,
  Calendar,
  Clock,
  Video,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface UpcomingClassItem {
  courseId: string;
  studentId: string;
  studentName: string;
  studentImage?: string;
  studentEmail?: string;
  courseTitle: string;
  grade?: string;
  time: string;
  scheduledDay: 'Today' | 'Tomorrow';
  startTimeIso: string;
  endTimeIso: string;
  status: 'live' | 'upcoming' | 'completed' | 'ended';
  joinLink?: string;
  noOfClasses?: number;
  isDemo?: boolean;
}

export interface WeeklyStudentClass {
  studentId: string;
  studentName: string;
  studentImage?: string;
  studentEmail?: string;
  courseId: string;
  courseTitle: string;
  grade?: string;
  time: string;
  joinLink?: string;
  noOfClasses?: number;
  isDemo?: boolean;
}

export interface WeeklyScheduleDay {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  shortName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  dayIndex: number;
  students: WeeklyStudentClass[];
}

interface DashboardData {
  totalStudents: number;
  activeCourses: number;
  totalEarnings: number;
  totalClasses: number;
  recentCourses: any[];
  recentActivity: any[];
  weeklySchedule?: WeeklyScheduleDay[];
  upcomingClasses?: UpcomingClassItem[];
}

const AVATAR_COLORS = [
  '#4f46e5',
  '#059669',
  '#d97706',
  '#db2777',
  '#7c3aed',
  '#0284c7',
  '#ea580c',
  '#0d9488',
];

function getAvatarColor(name: string = ''): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitials(name: string = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const DEFAULT_DAYS: WeeklyScheduleDay[] = [
  { dayName: 'Monday', shortName: 'Mon', dayIndex: 1, students: [] },
  { dayName: 'Tuesday', shortName: 'Tue', dayIndex: 2, students: [] },
  { dayName: 'Wednesday', shortName: 'Wed', dayIndex: 3, students: [] },
  { dayName: 'Thursday', shortName: 'Thu', dayIndex: 4, students: [] },
  { dayName: 'Friday', shortName: 'Fri', dayIndex: 5, students: [] },
  { dayName: 'Saturday', shortName: 'Sat', dayIndex: 6, students: [] },
  { dayName: 'Sunday', shortName: 'Sun', dayIndex: 0, students: [] },
];

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

const UpcomingClassesSection = ({ upcomingClasses = [] }: { upcomingClasses?: UpcomingClassItem[] }) => {
  const liveClasses = upcomingClasses.filter(c => c.status === 'live');
  const todayClasses = upcomingClasses.filter(c => c.scheduledDay === 'Today');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Box
        sx={{
          mb: 5,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: liveClasses.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(79, 70, 229, 0.12)',
                color: liveClasses.length > 0 ? '#10b981' : '#4f46e5',
                width: 44,
                height: 44,
                border: `1px solid ${liveClasses.length > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.25)'}`,
              }}
            >
              <Clock size={22} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                  Upcoming & Today's Classes
                </Typography>
                {liveClasses.length > 0 && (
                  <Chip
                    label={`${liveClasses.length} LIVE NOW`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      bgcolor: '#10b981',
                      color: '#ffffff',
                      borderRadius: 1.5,
                      letterSpacing: '0.5px',
                    }}
                  />
                )}
                <Chip
                  label="Next 24 Hours"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    borderRadius: 1.5,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.825rem' }}>
                All classes scheduled for today and the next 24 hours until they end
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${todayClasses.length} ${todayClasses.length === 1 ? 'student' : 'students'} to teach today`}
              size="small"
              sx={{
                bgcolor: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>

        {/* Classes Content */}
        {upcomingClasses.length === 0 ? (
          <Box
            sx={{
              py: 5,
              px: 2,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary', mb: 0.5 }}>
              No classes scheduled in the next 24 hours
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto' }}>
              You have no pending classes for today. Check your weekly timetable below to review upcoming days or view course details.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {upcomingClasses.map((item, idx) => {
              const isLive = item.status === 'live';
              const isCompleted = item.status === 'completed';
              const isEnded = item.status === 'ended';
              const avatarColor = getAvatarColor(item.studentName);

              return (
                <Box
                  key={`${item.courseId}-${item.scheduledDay}-${idx}`}
                  sx={{
                    borderRadius: 3.5,
                    p: 2.5,
                    bgcolor: isLive ? 'rgba(16, 185, 129, 0.04)' : 'background.paper',
                    border: isLive ? '2px solid' : '1px solid',
                    borderColor: isLive ? '#10b981' : 'divider',
                    boxShadow: isLive
                      ? '0 8px 24px -4px rgba(16, 185, 129, 0.25)'
                      : '0 2px 10px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: isLive ? '#10b981' : 'primary.main',
                      boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.15)',
                    },
                  }}
                >
                  <Box>
                    {/* Top status tag row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isLive && (
                          <Chip
                            label="LIVE NOW"
                            size="small"
                            sx={{
                              bgcolor: '#10b981',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.68rem',
                              height: 22,
                              borderRadius: 1.5,
                              letterSpacing: 0.5,
                            }}
                          />
                        )}
                        {item.status === 'upcoming' && (
                          <Chip
                            label={item.scheduledDay === 'Today' ? 'Today' : 'Tomorrow'}
                            size="small"
                            sx={{
                              bgcolor: item.scheduledDay === 'Today' ? 'rgba(79, 70, 229, 0.12)' : 'action.hover',
                              color: item.scheduledDay === 'Today' ? 'primary.main' : 'text.secondary',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 22,
                              borderRadius: 1.5,
                            }}
                          />
                        )}
                        {isCompleted && (
                          <Chip
                            label="Completed Today"
                            size="small"
                            icon={<CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                            sx={{
                              bgcolor: 'rgba(16, 185, 129, 0.12)',
                              color: '#10b981',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 22,
                              borderRadius: 1.5,
                            }}
                          />
                        )}
                        {isEnded && (
                          <Chip
                            label="Class Ended"
                            size="small"
                            sx={{
                              bgcolor: 'action.hover',
                              color: 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 22,
                              borderRadius: 1.5,
                            }}
                          />
                        )}
                        {item.isDemo && (
                          <Chip
                            label="Demo"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(236, 72, 153, 0.15)',
                              color: '#ec4899',
                              fontWeight: 700,
                              fontSize: '0.65rem',
                              height: 20,
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </Box>

                      {/* Scheduled Time badge */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isLive ? '#10b981' : 'text.secondary' }}>
                        <Clock size={13} />
                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                          {item.time || 'Time not set'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Student Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2 }}>
                      <Avatar
                        src={item.studentImage}
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: avatarColor,
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        {getInitials(item.studentName)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          noWrap
                          sx={{ color: 'text.primary', fontSize: '0.975rem', lineHeight: 1.25 }}
                          title={item.studentName}
                        >
                          {item.studentName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                            {item.grade ? `${item.grade} • ` : ''}{item.courseTitle}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Classes Left or Status detail */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, px: 1.25, py: 0.75, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Classes Remaining:
                      </Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary' }}>
                        {item.noOfClasses !== undefined ? `${item.noOfClasses} left` : 'Active'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1.25, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    {item.joinLink && !isCompleted ? (
                      <Button
                        component="a"
                        href={item.joinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="small"
                        startIcon={<Video size={15} />}
                        sx={{
                          flex: 1,
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: 2,
                          bgcolor: isLive ? '#10b981' : 'primary.main',
                          color: '#ffffff',
                          py: 0.85,
                          fontSize: '0.8rem',
                          boxShadow: isLive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                          '&:hover': {
                            bgcolor: isLive ? '#059669' : 'primary.dark',
                          },
                        }}
                      >
                        {isLive ? 'Join Live Now' : 'Join Class'}
                      </Button>
                    ) : null}

                    <Button
                      component={Link}
                      href={`/teacher/courses/${item.courseId}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        flex: item.joinLink && !isCompleted ? 'initial' : 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: 'divider',
                        color: 'text.primary',
                        py: 0.85,
                        px: 2,
                        fontSize: '0.8rem',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {isCompleted ? 'View Course' : 'Details'}
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

const WeeklyScheduleSection = ({ weeklySchedule = [] }: { weeklySchedule?: WeeklyScheduleDay[] }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...

  const daysToRender = weeklySchedule && weeklySchedule.length === 7 ? weeklySchedule : DEFAULT_DAYS;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const totalClassesThisWeek = daysToRender.reduce((acc, day) => acc + (day.students ? day.students.length : 0), 0);
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDayIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Box
        sx={{
          mb: 5,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(79, 70, 229, 0.12)',
                color: '#4f46e5',
                width: 44,
                height: 44,
                border: '1px solid rgba(79, 70, 229, 0.25)',
              }}
            >
              <Calendar size={22} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                  Weekly Class Timetable
                </Typography>
                <Chip
                  label="Monday to Sunday"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    borderRadius: 1.5,
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.825rem' }}>
                Horizontal weekday overview with all scheduled student classes
              </Typography>
            </Box>
          </Box>

          {/* Right actions: Today badge & scroll controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'auto' }, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Today: ${todayDayName}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 2,
                }}
              />
              <Chip
                label={`${totalClassesThisWeek} ${totalClassesThisWeek === 1 ? 'Class' : 'Classes'}/week`}
                size="small"
                sx={{
                  bgcolor: 'rgba(79, 70, 229, 0.1)',
                  color: '#4f46e5',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                }}
              />
            </Box>

            {/* Scroll navigation arrows for smaller viewports */}
            <Box sx={{ display: { xs: 'flex', xl: 'none' }, gap: 0.5 }}>
              <Button
                size="small"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                sx={{
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  p: 0,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                size="small"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                sx={{
                  minWidth: 32,
                  width: 32,
                  height: 32,
                  p: 0,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                }}
              >
                <ChevronRight size={18} />
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Horizontal Weekday Track (Monday to Sunday) */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(7, 270px)',
              xl: 'repeat(7, minmax(0, 1fr))',
            },
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            pt: 0.5,
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { height: 7 },
            '&::-webkit-scrollbar-track': { bgcolor: 'action.hover', borderRadius: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4, '&:hover': { bgcolor: 'text.secondary' } },
          }}
        >
          {daysToRender.map((day) => {
            const isToday = day.dayIndex === currentDayIndex;
            const studentList = day.students || [];
            const hasStudents = studentList.length > 0;

            return (
              <Box
                key={day.dayName}
                sx={{
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  p: 2,
                  minHeight: 280,
                  bgcolor: isToday ? 'rgba(79, 70, 229, 0.04)' : 'action.hover',
                  border: isToday ? '2px solid' : '1px solid',
                  borderColor: isToday ? '#6366f1' : 'divider',
                  boxShadow: isToday ? '0 8px 24px -4px rgba(99, 102, 241, 0.15)' : 'none',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: isToday ? '#6366f1' : 'text.disabled',
                  },
                }}
              >
                {/* Day Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.75,
                    pb: 1.25,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        color: isToday ? 'primary.main' : 'text.primary',
                        fontSize: '0.95rem',
                      }}
                    >
                      {day.dayName}
                    </Typography>
                    {isToday && (
                      <Chip
                        label="TODAY"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          bgcolor: 'primary.main',
                          color: '#fff',
                          borderRadius: 1,
                          letterSpacing: 0.5,
                        }}
                      />
                    )}
                  </Box>

                  <Chip
                    label={hasStudents ? `${studentList.length}` : '0'}
                    size="small"
                    sx={{
                      height: 22,
                      minWidth: 22,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      bgcolor: hasStudents ? (isToday ? 'primary.main' : 'rgba(79, 70, 229, 0.12)') : 'transparent',
                      border: hasStudents ? 'none' : '1px solid',
                      borderColor: 'divider',
                      color: hasStudents ? (isToday ? '#fff' : 'primary.main') : 'text.disabled',
                    }}
                  />
                </Box>

                {/* Students Container */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                  {!hasStudents ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 4,
                        px: 1,
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        No classes scheduled
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem', mt: 0.5 }}>
                        Rest day
                      </Typography>
                    </Box>
                  ) : (
                    studentList.map((student, idx) => {
                      const avatarColor = getAvatarColor(student.studentName);
                      return (
                        <Box
                          key={`${student.studentId}-${student.courseId}-${idx}`}
                          component={Link}
                          href={`/teacher/courses/${student.courseId}`}
                          sx={{
                            p: 1.5,
                            borderRadius: 2.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              borderColor: 'primary.main',
                              boxShadow: '0 6px 16px -2px rgba(79, 70, 229, 0.15)',
                            },
                          }}
                        >
                          {/* Student Info Row */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Avatar
                              src={student.studentImage}
                              sx={{
                                width: 34,
                                height: 34,
                                bgcolor: avatarColor,
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }}
                            >
                              {getInitials(student.studentName)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                noWrap
                                sx={{
                                  color: 'text.primary',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.25,
                                }}
                                title={student.studentName}
                              >
                                {student.studentName}
                              </Typography>
                              {student.grade ? (
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{ color: 'text.secondary', fontSize: '0.72rem', display: 'block' }}
                                >
                                  {student.grade}
                                </Typography>
                              ) : null}
                            </Box>
                          </Box>

                          {/* Course / Subject */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                            <BookOpen size={13} style={{ opacity: 0.7, flexShrink: 0 }} />
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              noWrap
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                              }}
                              title={student.courseTitle}
                            >
                              {student.courseTitle}
                            </Typography>
                            {student.isDemo && (
                              <Chip
                                label="Demo"
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  bgcolor: 'rgba(236, 72, 153, 0.15)',
                                  color: '#ec4899',
                                  borderRadius: 1,
                                }}
                              />
                            )}
                          </Box>

                          {/* Footer with Time & Actions */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              pt: 0.75,
                              borderTop: '1px dashed',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                              <Clock size={12} />
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{ fontSize: '0.725rem' }}
                              >
                                {student.time || 'Time not set'}
                              </Typography>
                            </Box>

                            {student.joinLink && (
                              <Box
                                component="span"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(student.joinLink, '_blank', 'noopener,noreferrer');
                                }}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'primary.main',
                                  color: '#ffffff !important',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                }}
                              >
                                <Video size={10} />
                                Join
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </motion.div>
  );
};

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

  const { totalStudents, activeCourses, totalClasses, totalEarnings = 0, recentCourses, recentActivity, weeklySchedule, upcomingClasses } = dashboardData;

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

      {/* Upcoming & Today's Classes (Next 24 Hours window) */}
      <UpcomingClassesSection upcomingClasses={upcomingClasses} />

      {/* Horizontal Line Weekday (Monday to Sunday) Class Timetable */}
      <WeeklyScheduleSection weeklySchedule={weeklySchedule} />

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