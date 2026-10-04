"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
  IconButton
} from "@mui/material";
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  MessageSquare,
  BookOpen,
  CreditCard,
  GraduationCap,
  Hash,
  IndianRupee,
  Calendar,
  Clock,
  Download,
  Video,
  Edit,
  Activity,
  Zap,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import CourseMessageModal from "@/components/CourseMessageModal";
import { CourseDetails } from "@/types/admin";
import { ITransaction } from "@/models/Transaction";
import AdminCourseEditModal from "@/components/AdminCourseEditModal";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface CompletedClass {
  _id: string;
  topic: string;
  duration?: number;
  completedAt: string;
  homeworkFile?: string;
}

function CourseDetailSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, mx: 'auto' }}>
      <Skeleton className="h-10 w-48 mb-8 bg-slate-200 dark:bg-white/5 rounded-xl" />
      
      {/* Banner Skeleton */}
      <Box sx={{ p: { xs: 4, md: 8 }, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <Box className="flex-1">
            <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/5 mb-4" />
            <Skeleton className="h-16 w-3/4 bg-slate-200 dark:bg-white/5 mb-4" />
            <Skeleton className="h-6 w-1/2 bg-slate-200 dark:bg-white/5" />
          </Box>
          <Box className="flex gap-4">
             <Skeleton className="h-14 w-40 bg-slate-200 dark:bg-white/5 rounded-2xl" />
             <Skeleton className="h-14 w-40 bg-slate-200 dark:bg-white/5 rounded-2xl" />
          </Box>
        </Box>
      </Box>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[...Array(3)].map((_, i) => (
          <Box key={i} sx={{ p: 5, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Skeleton className="h-10 w-40 bg-slate-200 dark:bg-white/5 mb-6" />
            <Stack spacing={3}>
               {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-12 w-full bg-slate-200 dark:bg-white/5 rounded-xl" />)}
            </Stack>
          </Box>
        ))}
      </div>

      <Skeleton className="h-[400px] w-full bg-slate-200 dark:bg-white/5 rounded-[2rem]" />
    </Box>
  );
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [completedClasses, setCompletedClasses] = useState<CompletedClass[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        const [courseRes, transactionsRes] = await Promise.all([
          fetch(`/api/course/${courseId}`),
          fetch(`/api/transactions?courseId=${courseId}`)
        ]);

        const courseData = await courseRes.json();
        if (!courseRes.ok || !courseData.success) {
          throw new Error(courseData.message || "Failed to fetch course details.");
        }
        setCourse(courseData.course);
        setCompletedClasses(courseData.completedClasses || []);

        const transactionsData = await transactionsRes.json();
        if (transactionsRes.ok && transactionsData.success) {
          setTransactions(transactionsData.transactions || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (loading) return <CourseDetailSkeleton />;
  if (error) return <Alert severity="error" className="m-8 bg-red-500/10 text-red-500 border-red-500/20">{error}</Alert>;
  if (!course) return <Alert severity="info" className="m-8 bg-blue-500/10 text-blue-500 border-blue-500/20">No course details found.</Alert>;

  const handleUpdateSuccess = (updatedCourse: CourseDetails) => {
    setCourse(updatedCourse);
  };

  const SectionHeader = ({ title, icon, subtitle }: { title: string, icon: React.ReactNode, subtitle?: string }) => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ color: '#818cf8', display: 'flex' }}>{icon}</Box>
        <Typography variant="h4" fontWeight="900" sx={{ color: 'text.primary', tracking: '-0.02em' }}>{title}</Typography>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, maxWidth: 1600, mx: 'auto' }}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          component={Link}
          href={`/admin/students/${studentId}`}
          startIcon={<ArrowLeft size={18} />}
          sx={{ mb: 6, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' }, fontWeight: 800, textTransform: 'none' }}
        >
          Back to Student Profile
        </Button>
      </motion.div>

      {/* Premium Header Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Box sx={{ 
          p: { xs: 4, md: 8 }, 
          borderRadius: 8, 
          bgcolor: 'background.paper', 
          border: '1px solid',
          borderColor: 'divider',
          mb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 4, position: 'relative', zIndex: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip label={course.grade.toUpperCase() + " GRADE"} sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 900, fontSize: '0.65rem', height: 26, border: '1px solid rgba(99, 102, 241, 0.2)' }} />
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.1em' }}>COURSE ID: {course._id.slice(-8).toUpperCase()}</Typography>
              </Box>
              <Typography variant="h2" fontWeight="900" sx={{ color: 'text.primary', tracking: '-0.05em', mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                {course.title}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: 600 }}>
                Specialized learning program managed by <span className="text-slate-900 dark:text-white font-bold">{course.teacherId.fullName}</span> for <span className="text-slate-900 dark:text-white font-bold">{course.studentId.fullName}</span>.
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {course.joinLink && (
                <Button
                  variant="contained"
                  startIcon={<Video size={18} />}
                  component="a"
                  href={course.joinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 4, px: 3, py: 1.5, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 900, textTransform: 'none' }}
                >
                  Join Session
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<MessageSquare size={18} />}
                onClick={() => setIsMessageModalOpen(true)}
                sx={{ borderRadius: 4, px: 3, py: 1.5, color: 'text.primary', borderColor: 'divider', bgcolor: 'action.hover', fontWeight: 900, textTransform: 'none', '&:hover': { bgcolor: 'action.selected', borderColor: '#6366f1' } }}
              >
                In-Course Messaging
              </Button>
              <Button
                variant="contained"
                startIcon={<Edit size={18} />}
                onClick={() => setIsEditModalOpen(true)}
                sx={{ borderRadius: 4, px: 3, py: 1.5, bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }, fontWeight: 900, textTransform: 'none' }}
              >
                Edit Configuration
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>

      {/* Grid Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Course Metrics */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Box sx={{ p: 5, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <SectionHeader title="Metrics" icon={<TrendingUp size={24} />} subtitle="Operational course data" />
                <Stack spacing={3}>
                   <MetricItem label="AVAILABLE SESSIONS" value={course.noOfClasses.toString()} icon={<Hash size={18} />} />
                   <MetricItem label="SESSION PRICE" value={`₹${course.perClassPrice}`} icon={<IndianRupee size={18} />} />
                   <MetricItem label="SCHEDULE TIME" value={course.classTime || "Flexible"} icon={<Clock size={18} />} />
                   <MetricItem label="RECURRENCE" value={course.classDays?.join(', ') || "Not set"} icon={<Calendar size={18} />} />
                </Stack>
              </Box>
           </motion.div>

           {/* Student Context */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <Box sx={{ p: 5, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <SectionHeader title="Student" icon={<User size={24} />} subtitle="Enrollment details" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                   <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 900, fontSize: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      {course.studentId.fullName.charAt(0)}
                   </Avatar>
                   <Box>
                      <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>{course.studentId.fullName}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{course.studentId.email}</Typography>
                   </Box>
                </Box>
                <Stack spacing={2.5}>
                   <MetricItem label="CONTACT" value={course.studentId.mobile || "N/A"} icon={<Phone size={16} />} />
                   <Button component={Link} href={`/admin/students/${studentId}`} fullWidth sx={{ borderRadius: 4, py: 1.5, bgcolor: 'action.hover', color: 'text.primary', fontWeight: 800, textTransform: 'none', border: '1px solid', borderColor: 'divider', mt: 2, '&:hover': { bgcolor: 'action.selected' } }}>
                      Full Student Profile
                   </Button>
                </Stack>
              </Box>
           </motion.div>

           {/* Teacher Context */}
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <Box sx={{ p: 5, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <SectionHeader title="Teacher" icon={<Zap size={24} />} subtitle="Assigned educator" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                   <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', fontWeight: 900, fontSize: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      {course.teacherId.fullName.charAt(0)}
                   </Avatar>
                   <Box>
                      <Typography variant="h6" fontWeight="800" sx={{ color: 'text.primary' }}>{course.teacherId.fullName}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{course.teacherId.email}</Typography>
                   </Box>
                </Box>
                <Stack spacing={2.5}>
                   <MetricItem label="CONTACT" value={course.teacherId.mobile || "N/A"} icon={<Phone size={16} />} />
                   <Button component={Link} href={`/admin/teachers/${course.teacherId._id}`} fullWidth sx={{ borderRadius: 4, py: 1.5, bgcolor: 'action.hover', color: 'text.primary', fontWeight: 800, textTransform: 'none', border: '1px solid', borderColor: 'divider', mt: 2, '&:hover': { bgcolor: 'action.selected' } }}>
                      Teacher Credentials
                   </Button>
                </Stack>
              </Box>
           </motion.div>
        </div>

        {/* Description Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
           <Box sx={{ p: 6, borderRadius: 8, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <SectionHeader title="Course Syllabus & Description" icon={<BookOpen size={24} />} />
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line', fontWeight: 500 }}>
                 {course.description}
              </Typography>
           </Box>
        </motion.div>

        {/* Dual Lists Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Transactions History */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                 <SectionHeader title="Financial Ledger" icon={<CreditCard size={24} />} subtitle="Recent billing activities" />
                 <Button component={Link} href={`/admin/students/${studentId}/${courseId}/transaction`} sx={{ color: '#818cf8', fontWeight: 800, textTransform: 'none' }}>Full Statement</Button>
              </Box>
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 8, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                 <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                      <div key={tx._id.toString()} className="p-6 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all">
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                               <Activity size={18} />
                            </Box>
                            <Box>
                               <Typography variant="body1" fontWeight="800" sx={{ color: 'text.primary' }}>{tx.numberOfClasses} Sessions Provisioned</Typography>
                               <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>ID: {tx.transactionId}</Typography>
                            </Box>
                         </Box>
                         <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="900" sx={{ color: 'text.primary' }}>₹{tx.amount.toFixed(2)}</Typography>
                            <Chip label={tx.paymentStatus.toUpperCase()} size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, bgcolor: tx.paymentStatus === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', color: tx.paymentStatus === 'completed' ? '#10b981' : '#f43f5e' }} />
                         </Box>
                      </div>
                    )) : (
                      <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                         <CreditCard size={48} className="mx-auto mb-4 text-slate-400" />
                         <Typography fontWeight="800" sx={{ color: 'text.primary' }}>NO FINANCIAL RECORDS</Typography>
                      </Box>
                    )}
                 </div>
              </Box>
           </motion.div>

           {/* Class Logs History */}
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <SectionHeader title="Academic Logs" icon={<Activity size={24} />} subtitle="Completed session history" />
              <Box sx={{ bgcolor: 'background.paper', borderRadius: 8, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                 <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {completedClasses.length > 0 ? completedClasses.slice(0, 5).map((c) => (
                      <div key={c._id} className="p-6 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group">
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                               <BookOpen size={18} />
                            </Box>
                            <Box>
                               <Typography variant="body1" fontWeight="800" sx={{ color: 'text.primary' }}>{c.topic}</Typography>
                               <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{new Date(c.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                            </Box>
                         </Box>
                         <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right', mr: 2 }}>
                               <Typography variant="body2" fontWeight="800" sx={{ color: 'text.primary' }}>{(c.duration || 0) / 60} hrs</Typography>
                               <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Duration</Typography>
                            </Box>
                            {c.homeworkFile && (
                              <IconButton size="small" href={c.homeworkFile} target="_blank" sx={{ bgcolor: 'action.hover', color: 'text.primary', '&:hover': { bgcolor: '#4f46e5', color: 'white' } }}>
                                 <Download size={18} />
                              </IconButton>
                            )}
                         </Box>
                      </div>
                    )) : (
                      <Box sx={{ p: 10, textAlign: 'center', opacity: 0.5 }}>
                         <Zap size={48} className="mx-auto mb-4 text-slate-400" />
                         <Typography fontWeight="800" sx={{ color: 'text.primary' }}>NO SESSIONS LOGGED</Typography>
                      </Box>
                    )}
                 </div>
              </Box>
           </motion.div>
        </div>
      </Box>

      <CourseMessageModal courseId={course._id} open={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} />
      <AdminCourseEditModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} course={course} onUpdateSuccess={handleUpdateSuccess} />
    </Box>
  );
}

const MetricItem = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', color: 'text.secondary', display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', lineHeight: 1, mb: 0.5 }}>{label}</Typography>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 800 }}>{value}</Typography>
    </Box>
  </Box>
);