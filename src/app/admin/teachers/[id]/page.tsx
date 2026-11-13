"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import {
  Mail,
  Phone,
  Book,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  FileText,
  Video,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Pencil,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { ICourse } from "@/models/Course";
import Link from "next/link";
import { motion } from "framer-motion";
import EditTeacherModal from "@/components/admin/EditTeacherModal";

export type TeacherFromAPI = {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string | Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  qualification?: string;
  experience?: string;
  experiance?: string;
  listOfSubjects?: string[];
  joinLink?: string;
  cvUrl?: string;
  aboutTeacher?: string;
  teacherStatus?: "pending" | "approved" | "rejected";
  profileImage?: string;
};

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

function buildWeeklySchedule(courses: ICourse[] = []): WeeklyScheduleDay[] {
  const scheduleMap: Record<string, WeeklyStudentClass[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  const addStudent = (day: string, item: WeeklyStudentClass) => {
    if (!scheduleMap[day]) return;
    const exists = scheduleMap[day].some(
      x => x.courseId === item.courseId && x.studentId === item.studentId && (x.time === item.time || (!x.time && !item.time))
    );
    if (!exists) {
      scheduleMap[day].push(item);
    }
  };

  for (const course of courses) {
    if (!course) continue;
    const student = course.studentId as any;
    const studentId = student?._id ? student._id.toString() : '';
    const studentName = student?.fullName || 'Student';
    const studentImage = student?.profileImage || '';
    const studentEmail = student?.email || '';
    const courseId = course._id ? course._id.toString() : '';
    const courseTitle = course.title || 'Course';
    const grade = course.grade || '';
    const defaultTime = course.teacherClassTime || course.classTime || '';
    const joinLink = course.joinLink || '';
    const noOfClasses = course.noOfClasses ?? 0;

    let matched = false;
    if (course.schedules && course.schedules.length > 0) {
      for (const s of course.schedules) {
        const d = s.teacherDay || s.studentDay || '';
        const dayStr = (d || s.teacherSchedule || s.studentSchedule || '').toLowerCase();
        const matchedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(dayName =>
          dayStr.includes(dayName.toLowerCase().substring(0, 3))
        );
        const timeFound = s.teacherTime || s.studentTime || defaultTime;
        for (const md of matchedDays) {
          matched = true;
          addStudent(md, {
            studentId,
            studentName,
            studentImage,
            studentEmail,
            courseId,
            courseTitle,
            grade,
            time: timeFound,
            joinLink,
            noOfClasses,
          });
        }
      }
    }

    if (course.classDays) {
      const daysArr = Array.isArray(course.classDays) ? course.classDays : String(course.classDays).split(',');
      for (const cd of daysArr) {
        const lower = String(cd).toLowerCase();
        const matchedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(dayName =>
          lower.includes(dayName.toLowerCase().substring(0, 3))
        );
        for (const md of matchedDays) {
          matched = true;
          addStudent(md, {
            studentId,
            studentName,
            studentImage,
            studentEmail,
            courseId,
            courseTitle,
            grade,
            time: defaultTime,
            joinLink,
            noOfClasses,
          });
        }
      }
    }

    if (!matched && defaultTime) {
      const lower = defaultTime.toLowerCase();
      const matchedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].filter(dayName =>
        lower.includes(dayName.toLowerCase().substring(0, 3))
      );
      for (const md of matchedDays) {
        addStudent(md, {
          studentId,
          studentName,
          studentImage,
          studentEmail,
          courseId,
          courseTitle,
          grade,
          time: defaultTime,
          joinLink,
          noOfClasses,
        });
      }
    }
  }

  const DAYS_ORDER: { dayName: WeeklyScheduleDay['dayName']; shortName: WeeklyScheduleDay['shortName']; dayIndex: number }[] = [
    { dayName: 'Monday', shortName: 'Mon', dayIndex: 1 },
    { dayName: 'Tuesday', shortName: 'Tue', dayIndex: 2 },
    { dayName: 'Wednesday', shortName: 'Wed', dayIndex: 3 },
    { dayName: 'Thursday', shortName: 'Thu', dayIndex: 4 },
    { dayName: 'Friday', shortName: 'Fri', dayIndex: 5 },
    { dayName: 'Saturday', shortName: 'Sat', dayIndex: 6 },
    { dayName: 'Sunday', shortName: 'Sun', dayIndex: 0 },
  ];

  return DAYS_ORDER.map(({ dayName, shortName, dayIndex }) => ({
    dayName,
    shortName,
    dayIndex,
    students: scheduleMap[dayName] || [],
  }));
}

const WeeklyScheduleSection = ({
  weeklySchedule = [],
  teacherId,
}: {
  weeklySchedule?: WeeklyScheduleDay[];
  teacherId: string;
}) => {
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Paper
        elevation={0}
        className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 5,
          bgcolor: 'background.paper',
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
                Horizontal weekday overview with all scheduled student classes for this teacher
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
                          href={`/admin/teachers/${teacherId}/${student.courseId}`}
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
      </Paper>
    </motion.div>
  );
};

interface ApiResponse {
  teacher: TeacherFromAPI;
  courses: ICourse[];
  weeklySchedule?: WeeklyScheduleDay[];
}

export default function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params); // Unwrap the params Promise
  const [teacher, setTeacher] = useState<TeacherFromAPI | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchTeacherDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teachers/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher details");
        }
        const data: ApiResponse = await response.json();
        setTeacher(data.teacher);
        setCourses(data.courses);
        if (data.weeklySchedule && data.weeklySchedule.length === 7) {
          setWeeklySchedule(data.weeklySchedule);
        } else {
          setWeeklySchedule(buildWeeklySchedule(data.courses));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]);

  // Check if URL has ?edit=true parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("edit") === "true") {
        setIsEditModalOpen(true);
      }
    }
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!teacher) {
    return <Alert severity="warning">No teacher data found.</Alert>;
  }

  const InfoItem = ({
    icon,
    label,
    value,
    action,
  }: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
    action?: React.ReactNode;
  }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ color: "primary.main" }}>{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="text.primary">
            {value || "N/A"}
          </Typography>
        </Box>
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );

  const formattedAddress = [
    teacher.address?.street,
    teacher.address?.city,
    teacher.address?.state,
    teacher.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const formattedDob = teacher.dateOfBirth
    ? new Date(teacher.dateOfBirth).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Top Navigation & Actions */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          component={Link}
          href="/admin/teachers"
          startIcon={<ArrowLeft size={18} />}
          sx={{
            color: "text.secondary",
            "&:hover": { color: "text.primary", bgcolor: "action.hover" },
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            px: 2.5,
            height: 40,
          }}
        >
          Back to Teachers
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsEditModalOpen(true)}
          startIcon={<Pencil size={16} />}
          sx={{
            height: 40,
            px: 3,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.875rem",
            boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
            "&:hover": {
              boxShadow: "0 6px 20px rgba(79, 70, 229, 0.35)",
            },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Weekly Class Timetable (Monday to Sunday) */}
      <WeeklyScheduleSection weeklySchedule={weeklySchedule} teacherId={id} />

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
        {/* Left Column - Teacher Details */}
        <Box sx={{ flex: "1 1 420px", minWidth: 320 }}>
          <Paper
            elevation={0}
            className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
            sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 5, bgcolor: "background.paper", height: "100%" }}
          >
            {/* Header with Avatar and Teacher Details */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                mb: 2.5,
              }}
            >
              <Avatar
                src={
                  teacher.profileImage ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${teacher.fullName}`
                }
                sx={{
                  width: 72,
                  height: 72,
                  fontSize: "2rem",
                  bgcolor: "primary.main",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
                  flexShrink: 0,
                }}
              >
                {teacher.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {teacher.fullName}
                  </Typography>
                  {/* Status Badge */}
                  {teacher.teacherStatus === "approved" && (
                    <Chip
                      icon={<ShieldCheck size={14} />}
                      label="Approved"
                      size="small"
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.12)",
                        color: "#10b981",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        "& .MuiChip-icon": { color: "#10b981" },
                      }}
                    />
                  )}
                  {teacher.teacherStatus === "rejected" && (
                    <Chip
                      icon={<ShieldAlert size={14} />}
                      label="Rejected"
                      size="small"
                      sx={{
                        bgcolor: "rgba(244, 63, 94, 0.12)",
                        color: "#f43f5e",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(244, 63, 94, 0.25)",
                        "& .MuiChip-icon": { color: "#f43f5e" },
                      }}
                    />
                  )}
                  {(!teacher.teacherStatus || teacher.teacherStatus === "pending") && (
                    <Chip
                      icon={<Clock size={14} />}
                      label="Pending"
                      size="small"
                      sx={{
                        bgcolor: "rgba(245, 158, 11, 0.12)",
                        color: "#f59e0b",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        "& .MuiChip-icon": { color: "#f59e0b" },
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {teacher.listOfSubjects?.join(", ") || "No subjects specified"}
                </Typography>
              </Box>
            </Box>

            {/* In-Card Edit Profile Button with Crisp Dimensions */}
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => setIsEditModalOpen(true)}
              startIcon={<Pencil size={15} />}
              sx={{
                height: 40,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                  bgcolor: "primary.main",
                  color: "white",
                },
                transition: "all 0.2s ease",
              }}
            >
              Edit Teacher Profile
            </Button>

            <Divider sx={{ my: 2.5, borderColor: "divider" }} />

            {/* Profile Fields */}
            <InfoItem icon={<Mail size={18} />} label="Email" value={teacher.email} />
            <InfoItem
              icon={<Book size={18} />}
              label="Subject"
              value={teacher.listOfSubjects?.join(", ")}
            />
            <InfoItem icon={<Phone size={18} />} label="Mobile" value={teacher.mobile} />
            <InfoItem
              icon={<GraduationCap size={18} />}
              label="Qualification"
              value={teacher.qualification}
            />
            <InfoItem
              icon={<Briefcase size={18} />}
              label="Experience"
              value={teacher.experience || (teacher as any).experiance}
            />

            {formattedDob && (
              <InfoItem icon={<Calendar size={18} />} label="Date of Birth" value={formattedDob} />
            )}

            {formattedAddress && (
              <InfoItem icon={<MapPin size={18} />} label="Address" value={formattedAddress} />
            )}

            {/* Meeting Link Item */}
            {teacher.joinLink && (
              <InfoItem
                icon={<Video size={18} />}
                label="Personal Meeting Link"
                value={teacher.joinLink}
                action={
                  <Button
                    size="small"
                    variant="text"
                    component="a"
                    href={teacher.joinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<ExternalLink size={14} />}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Open
                  </Button>
                }
              />
            )}

            {/* About / Bio Notes */}
            {teacher.aboutTeacher && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={0.5}>
                  About Teacher
                </Typography>
                <Typography variant="body2" color="text.primary">
                  {teacher.aboutTeacher}
                </Typography>
              </Box>
            )}

            {/* CV Document Link */}
            {teacher.cvUrl && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component="a"
                  href={teacher.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<FileText size={16} />}
                  sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold", width: "100%" }}
                >
                  View CV Document
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 2.5, borderColor: "divider" }} />

            <Typography variant="body2" color="text.secondary" fontWeight="bold" mb={1.5}>
              Subjects ({teacher.listOfSubjects?.length || 0})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {teacher.listOfSubjects && teacher.listOfSubjects.length > 0 ? (
                teacher.listOfSubjects.map((subject) => (
                  <Chip
                    key={subject}
                    label={subject}
                    variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No subjects listed.
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Assigned Courses */}
        <Box sx={{ flex: "2 1 600px" }}>
          <Paper
            elevation={0}
            className="border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
            sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 5, bgcolor: "background.paper" }}
          >
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Assigned Courses
            </Typography>
            <Divider sx={{ my: 2.5, borderColor: "divider" }} />
            {courses.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {courses.map((course) => (
                  <Paper
                    key={course._id.toString()}
                    elevation={0}
                    className="border border-slate-200 dark:border-slate-800"
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      bgcolor: "action.hover",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {course.title}
                        </Typography>
                        <Chip
                          label={course.noOfClasses > 0 ? "Running" : "Pending"}
                          size="small"
                          color={course.noOfClasses > 0 ? "success" : "warning"}
                          sx={{ fontWeight: "bold" }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Student:{" "}
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {(course.studentId as any)?.fullName || "N/A"}
                        </span>
                      </Typography>
                      <Divider sx={{ my: 1.5, borderColor: "divider" }} />
                      <Typography variant="body2" color="text.primary">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          Classes Left:
                        </span>{" "}
                        <span className="font-bold">{course.noOfClasses}</span>
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href={`/admin/teachers/${id}/${course._id.toString()}`}
                      variant="outlined"
                      color="primary"
                      endIcon={<ArrowRight size={16} />}
                      sx={{
                        mt: 2.5,
                        width: "100%",
                        borderRadius: 3,
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                    >
                      View Details
                    </Button>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                This teacher has not been assigned to any courses yet.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Edit Teacher Modal */}
      {teacher && (
        <EditTeacherModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          teacher={teacher}
          onSuccess={(updatedTeacher) => {
            setTeacher(updatedTeacher);
          }}
        />
      )}
    </Box>
  );
}
