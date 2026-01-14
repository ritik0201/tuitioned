"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Box,
  CardHeader,
  Paper,
  Chip,
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
} from "lucide-react";
import { Edit } from "lucide-react";
import Link from "next/link";
import CourseMessageModal from "@/components/CourseMessageModal";
import { CourseDetails } from "@/types/admin";
import { ITransaction } from "@/models/Transaction";
import AdminCourseEditModal from "@/components/AdminCourseEditModal";

interface CompletedClass {
  _id: string;
  topic: string;
  duration?: number;
  completedAt: string;
  homeworkFile?: string;
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [completedClasses, setCompletedClasses] = useState<CompletedClass[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // New state for edit modal

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      setLoading(true);
      try {
        // Fetch course and transaction details in parallel
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
        } else {
          console.warn("Could not fetch transaction details:", transactionsData.message);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

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

  if (!course) {
    return <Alert severity="info" sx={{ m: 4 }}>No course details found.</Alert>;
  }

  const handleUpdateSuccess = (updatedCourse: CourseDetails) => {
    setCourse(updatedCourse); // Update the course state on the page
  };

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
      <Button
        component={Link}
        href="/admin/students"
        startIcon={<ArrowLeft size={16} />}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Back to Students
      </Button>

      {/* Header */}
      <Paper
        elevation={0}
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
          <Typography variant="h4" component="h1" fontWeight={700}>
            {course.title}
          </Typography>
          <Typography variant="h6" component="p" sx={{ opacity: 0.8 }}>
            Grade: {course.grade}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {course.joinLink && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Video />}
              component="a"
              href={course.joinLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Class
            </Button>
          )}
          <Button
            variant="contained"
            color="info"
            startIcon={<MessageSquare />}
            onClick={() => setIsMessageModalOpen(true)}
          >
            View Messages
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Edit />}
            onClick={() => setIsEditModalOpen(true)} // Open the edit modal
          >
            Edit Course
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Top row of cards */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Course Details */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader title="Course Details" />
              <Divider />
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <InfoItem icon={<BookOpen size={20} />} label="Title" value={course.title} />
                <InfoItem icon={<GraduationCap size={20} />} label="Grade" value={course.grade} />
                <InfoItem icon={<Hash size={20} />} label="Remaining Classes" value={course.noOfClasses.toString()} />
                <InfoItem icon={<IndianRupee size={20} />} label="Price/Class" value={`₹${course.perClassPrice.toFixed(2)}`} />
                {course.classTime && <InfoItem icon={<Clock size={20} />} label="Time" value={course.classTime} />}
                {course.classDays && <InfoItem icon={<Calendar size={20} />} label="Days" value={course.classDays.join(', ')} />}
              </CardContent>
            </Card>
          </Box>

          {/* Student Details */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader title="Student Information" />
              <Divider />
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <InfoItem icon={<User size={20} />} label="Name" value={course.studentId.fullName} />
                <InfoItem icon={<Mail size={20} />} label="Email" value={course.studentId.email} />
                <InfoItem icon={<Phone size={20} />} label="Mobile" value={course.studentId.mobile || "N/A"} />
              </CardContent>
            </Card>
          </Box>

          {/* Teacher Details */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
              <CardHeader title="Teacher Information" />
              <Divider />
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <InfoItem icon={<User size={20} />} label="Name" value={course.teacherId.fullName} />
                <InfoItem icon={<Mail size={20} />} label="Email" value={course.teacherId.email} />
                <InfoItem icon={<Phone size={20} />} label="Mobile" value={course.teacherId.mobile || "N/A"} />
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Bottom row for description */}
        {/* Description */}
        <Box>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Course Description" />
            <Divider />
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {course.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Transaction History */}
        <Box>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Transaction History"
              action={
                <Button
                  component={Link}
                  href={`/admin/students/${params.id}/${courseId}/transaction`}
                  size="small"
                >View All</Button>
              }
            />
            <Divider />
            {/* <CardContent>
              {transactions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {transactions.map((tx) => ( 
                    <Paper key={tx._id.toString()} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {tx.numberOfClasses} {tx.numberOfClasses > 1 ? 'classes' : 'class'} added
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CreditCard size={14} /> {tx.transactionId}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={tx.paymentStatus.toUpperCase()}
                          size="small"
                          color={
                            tx.paymentStatus === 'completed' ? 'success' :
                            tx.paymentStatus === 'pending' ? 'warning' : 'error'
                          }
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="body1" fontWeight="500">
                          ₹{tx.amount.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tx.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" variant="outlined">
                  No transactions found for this course.
                </Alert>
              )}
            </CardContent> */}
          </Card>
        </Box>

        {/* Completed Classes History */}
        <Box>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Completed Class History" />
            <Divider />
            <CardContent>
              {completedClasses.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {completedClasses.map((c) => (
                    <Paper key={c._id} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">{c.topic}</Typography>
                        {c.homeworkFile && (
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<Download size={16} />}
                            href={c.homeworkFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            sx={{ mt: 0.5, p: 0.5, textTransform: 'none' }}
                          >
                            Download Homework
                          </Button>
                        )}
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" color="text.secondary">{new Date(c.completedAt).toLocaleDateString()}</Typography>
                        {c.duration && <Typography variant="caption" color="text.secondary">{(c.duration / 60).toFixed(1).replace(/\.0$/, '')} hours</Typography>}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" variant="outlined">No classes have been marked as complete yet.</Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Message Modal */}
      <CourseMessageModal
        courseId={course._id}
        open={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
      />

      {/* Admin Course Edit Modal */}
      {course && (
        <AdminCourseEditModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          course={course}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </Box>
  );
}

/**
 * A helper component to display an item with an icon, label, and value.
 */
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="500">
        {value}
      </Typography>
    </Box>
  </Box>
);