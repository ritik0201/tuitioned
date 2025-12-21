"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  IndianRupee,
  Mail,
  Save,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  _id: string;
  fullName: string;
  email: string;
}

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  grade: string;
  noOfClasses: number;
  perClassPrice: number;
  noOfclassTeacher?: number;
  teacherPerClassPrice?: number;
  studentId: Student;
  classTime?: string;
  classDays?: string;
}

interface CompletedClass {
  _id: string;
  topic: string;
  duration?: number;
  completedAt: string;
}

interface ApiResponse {
  course: CourseDetails;
  completedClasses: CompletedClass[];
}

export default function TeacherCourseDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;
  const courseId = params.courseId as string;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isEditingClassesTaught, setIsEditingClassesTaught] = useState(false);
  const [classesTaughtValue, setClassesTaughtValue] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId || !courseId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teachers/${teacherId}/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course details.");
        }
        const responseData: ApiResponse = await response.json();
        setData(responseData);
        if (responseData.course) {
          setClassesTaughtValue(String(responseData.course.noOfclassTeacher || 0));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [teacherId, courseId]);

  const handleUpdateClassesTaught = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/course/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noOfclassTeacher: Number(classesTaughtValue) }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update classes taught.');
      }

      toast.success('Successfully updated classes taught.');
      setData(prevData => prevData ? { ...prevData, course: result.course } : null);
      setIsEditingClassesTaught(false);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  if (!data) {
    return <Alert severity="info" sx={{ m: 4 }}>No course data found.</Alert>;
  }

  if (!data.course) {
    return <Alert severity="warning" sx={{ m: 4 }}>Course details are not available.</Alert>;
  }

  const { course, completedClasses } = data;
  const teacherEarning = (course.noOfclassTeacher || 0) * (course.teacherPerClassPrice || 0);

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight="medium">{value || 'N/A'}</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Button
        startIcon={<ArrowLeft size={16} />} 
        href={`/admin/teachers/${teacherId}`} sx={{ mb: 3, textTransform: "none", color: "text.secondary" }}
      >
        Back to Teacher Details
      </Button>

      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 3,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "primary.contrastText",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>{course.title}</Typography>
          <Typography variant="h6" component="p" sx={{ opacity: 0.8 }}>Grade: {course.grade}</Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {isEditingClassesTaught ? (
            <TextField
              label="Classes Taught"
              type="number"
              value={classesTaughtValue}
              onChange={(e) => setClassesTaughtValue(e.target.value)}
              size="small"
              variant="filled"
              autoFocus
              disabled={isSubmitting}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, '& .MuiInputBase-root': { color: 'white' }, '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.7)' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleUpdateClassesTaught} disabled={isSubmitting} size="small" sx={{ color: 'white' }}>
                      {isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save size={20} />}
                    </IconButton>
                    <IconButton onClick={() => setIsEditingClassesTaught(false)} disabled={isSubmitting} size="small" sx={{ color: 'white' }}>
                      <X size={20} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoItem icon={<GraduationCap size={20} />} label="Classes Taught" value={`${String(course.noOfclassTeacher || 0)}`} />
              <IconButton
                onClick={() => setIsEditingClassesTaught(true)}
                size="small"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              ><Edit size={16} /></IconButton>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Left Column - Course & Student Info */}
        <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937', height: '100%' }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>Course & Payment Info</Typography>
            <Divider sx={{ my: 2 }} />
            <InfoItem icon={<BookOpen size={20} />} label="Classes Left" value={String(course.noOfClasses)} />
            <InfoItem icon={<Clock size={20} />} label="Class Time" value={course.classTime} />
            <InfoItem icon={<Calendar size={20} />} label="Class Days" value={course.classDays} />
            <InfoItem icon={<IndianRupee size={20} />} label="Price Per Class" value={`₹${course.perClassPrice.toFixed(2)}`} />
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="medium" gutterBottom>Payment Status</Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
              <Typography
                variant="h5"
                component="p"
                fontWeight={700}
                color="secondary.main"
              >
                ₹{teacherEarning.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending Teacher Payment</Typography>
            </Paper>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight="medium" gutterBottom>Student</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>{course.studentId.fullName.charAt(0)}</Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">{course.studentId.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{course.studentId.email}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Completed Classes */}
        <Box sx={{ flex: '2 1 600px' }}>
          <Paper
            elevation={0}
            className="border-2 border-blue-500"
            sx={{ p: 3, borderRadius: 4, bgcolor: '#1f2937' }}
          >
            <Typography variant="h5" fontWeight="bold">Completed Class History</Typography>
            <Divider sx={{ my: 2 }} />
            {completedClasses.length > 0 ? (
              <Box
                sx={{
                  position: "relative",
                  pl: 2,
                  '::before': {
                    content: '""',
                    position: "absolute",
                    top: '10px',
                    bottom: '10px',
                    left: "18px",
                    width: "2px",
                    bgcolor: "divider",
                  },
                }}
              >
                {completedClasses.map((c, index) => (
                  <Box
                    key={c._id}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: index === completedClasses.length - 1 ? 0 : 3,
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "5px",
                        left: "-8px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        border: "3px solid",
                        borderColor: "#1f2937",
                        zIndex: 1,
                      }}
                    />
                    <Box sx={{ pl: 3, flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{c.topic}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "text.secondary", mt: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Calendar size={14} />
                          <Typography variant="caption">{new Date(c.completedAt).toLocaleDateString()}</Typography>
                        </Box>
                        {c.duration && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Clock size={14} />
                            <Typography variant="caption">{c.duration} minutes</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ bgcolor: 'transparent', border: '1px solid', borderColor: 'info.main' }}>
                No classes have been marked as complete for this course yet.
              </Alert>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}