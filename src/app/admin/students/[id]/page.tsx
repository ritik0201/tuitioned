"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Avatar,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Mail,
  Phone,
  PlusCircle,
  Cake,
  User,
  MapPin,
  GraduationCap,
  Globe,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateCourseForm from "@/components/admin/CreateCourseForm";
import { ICourse } from "@/models/Course";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";

export type StudentFromAPI = {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  grade?: string;
  fatherName?: string;
  country?: string;
};

function StudentDetailSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, mx: 'auto' }}>
      <Skeleton className="h-10 w-48 mb-8 bg-white/5 rounded-xl" />
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8 }}>
        {/* Sidebar Skeleton */}
        <Box sx={{ flex: '0 0 450px' }}>
          <Box sx={{ p: 6, bgcolor: 'rgba(255, 255, 255, 0.02)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
              <Skeleton className="w-[140px] h-[140px] rounded-full bg-white/5 mb-4" />
              <Skeleton className="h-10 w-3/4 bg-white/5 mb-2" />
              <Skeleton className="h-5 w-1/2 bg-white/5" />
            </Box>
            <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
            <Stack spacing={3}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/5" />
                  <Box className="flex-1">
                    <Skeleton className="h-3 w-1/3 bg-white/5 mb-2" />
                    <Skeleton className="h-5 w-3/4 bg-white/5" />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
        {/* Content Skeleton */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Skeleton className="h-12 w-64 bg-white/5" />
            <Skeleton className="h-12 w-40 bg-white/5 rounded-xl" />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 4 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[280px] bg-white/5 rounded-3xl" />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [student, setStudent] = useState<StudentFromAPI | null>(null);
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      try {
        const [studentRes, coursesRes] = await Promise.all([
          fetch(`/api/students/${id}`),
          fetch(`/api/students/${id}/my-courses`),
        ]);

        if (!studentRes.ok) throw new Error("Failed to fetch student details");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");

        setStudent(await studentRes.json());
        setCourses(await coursesRes.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params, isDialogOpen]);

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/course/${courseId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to delete course");

      setCourses((prev) => prev.filter((c) => c._id.toString() !== courseId));
      toast.success("Course deleted successfully");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <StudentDetailSkeleton />;
  if (error) return <Alert severity="error" className="m-8 bg-red-500/10 text-red-500 border-red-500/20">{error}</Alert>;
  if (!student) return <Alert severity="warning" className="m-8 bg-amber-500/10 text-amber-500 border-amber-500/20">No student data found.</Alert>;

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, py: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', color: 'rgba(255, 255, 255, 0.4)', display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 800, letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
          {value || 'Not specified'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, mx: 'auto' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          component={Link}
          href="/admin/students"
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 6, color: 'rgba(255, 255, 255, 0.4)', '&:hover': { color: 'white', bgcolor: 'transparent' }, fontWeight: 800, textTransform: 'none' }}
        >
          Back to Student Directory
        </Button>
      </motion.div>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8 }}>
        {/* Profile Card Sidebar */}
        <Box sx={{ flex: '0 0 450px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Box sx={{ 
              p: 6, 
              bgcolor: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: 8, 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'sticky',
              top: 100
            }}>
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Avatar
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                  sx={{ 
                    width: 140, 
                    height: 140, 
                    mx: 'auto', 
                    mb: 4, 
                    fontSize: '4rem', 
                    fontWeight: 900,
                    bgcolor: 'indigo.600',
                    border: '4px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}
                >
                  {student.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h3" fontWeight="900" sx={{ color: 'white', tracking: '-0.04em', mb: 1 }}>
                  {student.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                  {student.email}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                   <Chip label="ACTIVE STUDENT" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 900, fontSize: '0.6rem', border: '1px solid rgba(16, 185, 129, 0.2)' }} />
                   <Chip label={`GRADE ${student.grade || 'N/A'}`} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 900, fontSize: '0.6rem', border: '1px solid rgba(99, 102, 241, 0.2)' }} />
                </Box>
              </Box>

              <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.05)' }} />

              <Stack spacing={1}>
                <InfoItem icon={<Phone size={18} />} label="CONTACT NUMBER" value={student.mobile} />
                <InfoItem icon={<User size={18} />} label="GUARDIAN / FATHER" value={student.fatherName} />
                <InfoItem icon={<Cake size={18} />} label="DATE OF BIRTH" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'} />
                <InfoItem icon={<Globe size={18} />} label="RESIDENCE COUNTRY" value={student.country} />
                <InfoItem icon={<MapPin size={18} />} label="MAILING ADDRESS" value={`${student.address?.street || ''} ${student.address?.city || ''} ${student.address?.state || ''}`.trim() || 'N/A'} />
              </Stack>
            </Box>
          </motion.div>
        </Box>

        {/* Courses Section */}
        <Box sx={{ flex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight="900" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Layers className="text-indigo-500" size={32} />
                  Enrolled Courses
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.4)', mt: 1, fontWeight: 500 }}>
                  Managing academic progress and enrollments
                </Typography>
              </Box>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="contained" 
                    startIcon={<PlusCircle size={20} />} 
                    sx={{ 
                      borderRadius: 4, 
                      px: 4, 
                      py: 1.5, 
                      bgcolor: 'indigo.600', 
                      '&:hover': { bgcolor: 'indigo.700' }, 
                      fontWeight: 900, 
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)'
                    }}
                  >
                    New Enrollment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl bg-[#030712] border border-white/10 text-white shadow-2xl p-0 gap-0 overflow-hidden z-[1200] max-h-[90vh] flex flex-col rounded-[2rem]">
                  <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02] shrink-0 text-left">
                    <DialogTitle className="text-3xl font-black text-white flex items-center gap-3">
                       <Sparkles className="text-amber-500" />
                       Create New Course
                    </DialogTitle>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1, fontWeight: 500 }}>
                      Configure specialized curriculum for <span className="text-white font-black">{student.name}</span>
                    </Typography>
                  </DialogHeader>
                  <div className="p-8 overflow-y-auto scrollbar-hide">
                    <CreateCourseForm
                      studentId={student._id}
                      onCourseCreated={() => setIsDialogOpen(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </Box>

            {courses.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 4 }}>
                {courses.map((course, idx) => (
                  <motion.div 
                    key={course._id.toString()} 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 0.3 + (idx * 0.05) }}
                  >
                    <Box sx={{ 
                      p: 4, 
                      bgcolor: 'rgba(255, 255, 255, 0.02)', 
                      borderRadius: 6, 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.3s',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)', transform: 'translateY(-4px)', borderColor: 'rgba(99, 102, 241, 0.2)' }
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box>
                            <Typography variant="h5" fontWeight="900" sx={{ color: 'white', mb: 0.5 }}>{course.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                              {course.grade} Grade Level
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <Chip
                              label={course.noOfClasses > 0 ? "LIVE" : "COMPLETED"}
                              sx={{ 
                                bgcolor: course.noOfClasses > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                                color: course.noOfClasses > 0 ? '#10b981' : '#f59e0b',
                                fontWeight: 900,
                                fontSize: '0.6rem',
                                height: 24
                              }}
                            />
                            <IconButton 
                              onClick={() => handleDeleteCourse(course._id.toString())} 
                              sx={{ 
                                color: 'rgba(244, 63, 94, 0.4)', 
                                '&:hover': { color: '#f43f5e', bgcolor: 'rgba(244, 63, 94, 0.1)' },
                                borderRadius: 3,
                                transition: 'all 0.2s'
                              }} 
                              size="small"
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                        
                        <Stack spacing={2} sx={{ mb: 4 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>Active Classes Remaining</Typography>
                             <Typography variant="body1" sx={{ color: 'white', fontWeight: 800 }}>{course.noOfClasses}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>Tuition Rate</Typography>
                             <Typography variant="body1" sx={{ color: 'white', fontWeight: 800 }}>₹{course.perClassPrice}/session</Typography>
                          </Box>
                        </Stack>
                      </Box>

                      <Button
                        component={Link}
                        href={`/admin/students/${student._id}/${course._id}`}
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowRight size={18} />}
                        sx={{ 
                          borderRadius: 4, 
                          py: 2, 
                          borderColor: 'rgba(255, 255, 255, 0.1)', 
                          color: 'white', 
                          fontWeight: 800, 
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'white', color: 'black', borderColor: 'white' },
                          transition: 'all 0.3s'
                        }}
                      >
                        Launch Detailed Review
                      </Button>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                p: 12, 
                textAlign: 'center', 
                bgcolor: 'rgba(255, 255, 255, 0.01)', 
                borderRadius: 8, 
                border: '1px dashed rgba(255, 255, 255, 0.05)' 
              }}>
                 <GraduationCap size={64} className="mx-auto mb-6 text-gray-700 opacity-20" />
                 <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 700 }}>
                   No course enrollments detected for this student.
                 </Typography>
              </Box>
            )}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
