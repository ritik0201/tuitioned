"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; 
import { useParams, useRouter, notFound, useSearchParams } from "next/navigation";
import {
  CircularProgress,
  Alert,
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Video,
  IndianRupee,
  PlusCircle,
  Info,
  Plus,
  Minus,
  MessageSquare,
} from "lucide-react";
import { Download } from "lucide-react";
import Calendar from "@/components/lightswind/calendar";
import { toast } from "sonner";
import CourseMessageModal from "@/components/CourseMessageModal";
import { type RazorpayOptions } from "@/types/global";

interface ICourse { 
  _id: string;
  studentId: string; // Add studentId to ICourse for message modal context
  title: string;
  description: string;
  grade: string;
  classTime?: string;
  classDays?: string[];
  noOfClasses: number;
  perClassPrice: number;
  joinLink?: string;
  classroomLink?: string;
  paymentStatus?: "pending" | "completed" | "failed"; // This is already here
  teacherName?: string;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
  completedClasses?: CompletedClass[];
}

interface CompletedClass {
  _id: string;
  topic: string;
  duration?: number;
  completedAt: string;
  homeworkFile?: string;
}

interface ApiResponse {
  course: ICourse;
  completedClasses: CompletedClass[];
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-400",
  completed: "bg-green-100 text-green-700 border-green-400",
  failed: "bg-red-100 text-red-700 border-red-400",
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const courseId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [course, setCourse] = useState<ICourse | null>(null);
  const [completedClasses, setCompletedClasses] = useState<CompletedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // New state for message modal
  const [classesToAdd, setClassesToAdd] = useState(6);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClassesToAdd(6); // Reset on close
  };

  const handleIncrease = () => setClassesToAdd((prev) => prev + 1);
  const handleDecrease = () => setClassesToAdd((prev) => Math.max(6, prev - 1));

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      // Load Razorpay script
      if (!document.getElementById("razorpay-script")) {
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/student-courses/${courseId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch course details.");
        }
        const data: ApiResponse = await response.json();
        if (data.course) {
          setCourse(data.course);
          setCompletedClasses(data.completedClasses || []);
          const completedDays = (data.completedClasses || []).map(c => new Date(c.completedAt));
          if (completedDays.length > 0) {
            setCalendarMonth(completedDays[0]);
          }
        } else {
          notFound();
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();

    // Check for payment retry parameters in the URL
    const retry = searchParams.get('retry');
    const classes = searchParams.get('classes');

    if (retry === 'true' && classes) {
      const numClasses = parseInt(classes, 10);
      if (!isNaN(numClasses) && numClasses > 0) {
        setClassesToAdd(Math.max(6, numClasses));
        handleOpenModal();
      }
    }
  }, [courseId, notFound, searchParams]);

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
    return notFound();
  }

  const handleProcessPayment = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to make a payment.");
      return;
    }
    if (!course) {
      toast.error("Course details not found.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create a Razorpay order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          // Using a shorter receipt ID to stay within Razorpay's 40-character limit.
          receipt: `rec_${course._id}_${Date.now() % 10000000}`,
        }),
      });
      const order = await res.json();

      if (!res.ok) {
        throw new Error(order.message || "Failed to create payment order.");
      }

      // 2. Create a pending transaction record in the database
      const transactionRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          amount: totalPrice,
          numberOfClasses: classesToAdd,
          currency: order.currency,
          transactionId: order.id, // Razorpay Order ID
          paymentGateway: 'Razorpay',
        }),
      });

      if (!transactionRes.ok) {
        console.error("Failed to create pending transaction record.");
        // We can still proceed with payment, but this should be logged.
      }

      // 3. Open Razorpay checkout
      const options: RazorpayOptions & { modal: { ondismiss: () => void } } = {
        key: process.env.NEXT_PUBLIC_RP_KEY_ID ?? "",
        amount: order.amount,
        currency: order.currency,
        name: "Tuition ED",
        description: `Payment for ${classesToAdd} extra classes for ${course.title}`,
        order_id: order.id,
        handler: async function (response) { // This handler is only called on successful payment
          // 4. Verify payment and update database (which adds the classes)
          const updateRes = await fetch("/api/student-courses/update-classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              classesToAdd: classesToAdd, // Corrected parameter name
              currentClasses: course.noOfClasses, // Pass current classes for safe calculation
              paymentStatus: 'completed', // Set the new payment status for the course
            }),
          });

          if (updateRes.ok) {
            // 5. Update the transaction status to 'completed'
            await fetch('/api/transactions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transactionId: response.razorpay_order_id,
                status: 'completed',
              }),
            });

            toast.success("Payment successful! Your course has been updated.");
            router.refresh(); // Refresh the page to show updated class count
            handleCloseModal();
          } else {
            const errorData = await updateRes.json();
            toast.error(errorData.message || "Failed to update course after payment.");
          }
        },
        prefill: {
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          contact: (session.user as any).mobile || "",
        },
        modal: {
          ondismiss: async () => {
            toast.info("Payment was cancelled.");
            // Update the transaction to 'failed' since the user closed the modal
            await fetch('/api/transactions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transactionId: order.id,
                status: 'failed',
              }),
            });
          },
        },
        theme: { color: "#4f46e5" }, // Indigo color
      };

      if (typeof window.Razorpay !== "function") {
        toast.error("Razorpay SDK not loaded. Please try again in a moment.");
        setIsProcessing(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = course ? classesToAdd * course.perClassPrice : 0;
  const completedDays = completedClasses.map(c => new Date(c.completedAt));
  const completedClassesCount = completedClasses.length;
  const remainingClasses = course.noOfClasses;
  const totalCourseClasses = remainingClasses + completedClassesCount;
  const completionPercentage = totalCourseClasses > 0 ? (completedClassesCount / totalCourseClasses) * 100 : 0;

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, sm: 3, lg: 4 } }}>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={() => router.back()}
        sx={{ mb: 3, textTransform: "none", color: "text.secondary" }}
      >
        Back to Courses
      </Button>

      {/* === CLASS MANAGEMENT BAR === */}
      <Box mb={4}>
        <Paper
          elevation={0}
          className="border-blue-500 border"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            bgcolor: '#1f2937'
          }}
        >
          <Typography variant="h6" fontWeight="medium" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, textAlign: { xs: 'center', sm: 'left' }, width: { xs: '100%', sm: 'auto' } }}>
            Manage Your Enrollment
          </Typography>
          <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-end' }} gap={{ xs: 2, sm: 3 }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Typography variant="body1">
              <span className="font-semibold">{course.noOfClasses}</span> Classes 
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PlusCircle size={18} />}
              onClick={handleOpenModal}
            >
              Add Classes
            </Button>
          </Box>
        </Paper>
      </Box>


      {/* === MAIN COURSE DETAILS SECTION === */}
<Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 3, md: 4 },
    mt: 2,
  }}
>
  {/* === LEFT SECTION === */}
  <Box flex={1}>
    <Paper
      elevation={0}
      className="border-blue-500 border"
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        bgcolor: '#1f2937',
      }}
    >
      {/* STATUS CHIP */}
      <Chip
        label={course.noOfClasses > 0 ? "RUNNING" : "PENDING"}
        size="small"
        color={
          course.noOfClasses > 0
            ? "success"
            : "warning"
        }
        sx={{ mb: 2 }}
      />

      {/* COURSE TITLE & GRADE */}
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "text.primary", fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
      >
        {course.title}
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
        Grade {course.grade}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* COURSE DETAILS */}
      <Box
        component="ul"
        sx={{
          p: 0,
          m: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Per Class Price */}
        <Box
          component="li"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 1,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <IndianRupee size={20} className="text-gray-500" />
          <Typography variant="body2">
            ₹{course.perClassPrice.toFixed(2)} per class
          </Typography>
        </Box>

        {/* Class Days */}
        {course.classDays && (
          <Box
            component="li"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1,
              borderRadius: 2,
              bgcolor: "action.hover",
              flexWrap: "wrap",
            }}
          >
            <CalendarIcon size={20} className="text-gray-500" />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {course.classDays.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* COURSE DESCRIPTION */}
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        Description
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
      >
        {course.description}
      </Typography>
    </Paper>
  </Box>

  {/* === RIGHT SECTION === */}
  <Box
    flexBasis={{ xs: "100%", md: "35%" }}
    sx={{ display: "flex", flexDirection: "column" }}
  >
    <Paper
      elevation={0}
      className="border-blue-500 border"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 4,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", 
        bgcolor: '#1f2937'
      }}
    >
      {/* SCHEDULE & INSTRUCTOR */}
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Schedule & Instructor
        </Typography>

        <Box
          component="ul"
          sx={{
            p: 0,
            m: 0,
            mt: 2,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {course.teacherName && (
            <Box
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{ flexShrink: 0, width: 80 }}
              >
                Teacher:
              </Typography>
              <Typography
                variant="body2"
                color="text.primary"
                fontWeight="medium"
              >
                {course.teacherName}
              </Typography>
            </Box>
          )}

          {course.classTime && (
            <Box
              component="li"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Clock size={20} className="text-gray-500" />
              <Typography variant="body2">{course.classTime}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* ACTION BUTTONS */}
      <Box display="flex" flexDirection="column" gap={2}>
        {/* New Message Button */}
        <Button
          size="large"
          variant="outlined"
          color="primary"
          startIcon={<MessageSquare />}
          onClick={() => setIsMessageModalOpen(true)} // Open the message modal
        >
          Send Message
        </Button>

        {/* Existing Join Class Button */}
        <Button
          size="large"
          {...(course.joinLink ? { href: course.joinLink, target: "_blank" } : {})}
          rel="noopener noreferrer"
          variant="contained"
          startIcon={<Video />}
          disabled={!course.joinLink || course.noOfClasses <= 0}
        >
          Join Class
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          size="large"
          {...(course.classroomLink ? { href: course.classroomLink, target: "_blank" } : {})}
          disabled={!course.classroomLink || course.noOfClasses <= 0}
        >
          Visit Classroom
        </Button>
      </Box>
    </Paper>
  </Box>
</Box>


      {/* === PROGRESS SECTION === */}
      <Box mt={4}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "stretch", // Use stretch to make children fill the height
          }}
        >
          {/* Left: Two progress circles */}
          <Paper
            elevation={0}
            className="border-blue-500 border"
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#1f2937'
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Classes Status <Info size={14} className="inline ml-1 text-gray-500" />
            </Typography>
            <Divider />
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-around', 
              alignItems: 'center', 
              flexGrow: 1,
              gap: { xs: 4, sm: 2 }
            }}>
              {/* Circle 1 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={completionPercentage}
                    size={100}
                    thickness={4}
                    sx={{ color: 'success.main' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {completedClassesCount}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Classes Completed
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Divider sx={{ width: '80%', display: { xs: 'block', sm: 'none' } }} />

              {/* Circle 2 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={100}
                    thickness={4}
                    sx={{ color: 'warning.main' }}
                  />
                  <Box
                    sx={{
                      top: 0, left: 0, bottom: 0, right: 0,
                      position: 'absolute',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" component="div" fontWeight="bold">
                      {remainingClasses}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Remaining Classes
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Right: Monthly Progress calendar */}
          <Paper
            elevation={0}
            className="border-blue-500 border"
            sx={{
              flexBasis: { xs: "100%", md: "40%" },
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              textAlign: "center",
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#1f2937',
              overflowX: 'auto',
              maxWidth: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Monthly Progress <Info size={14} className="inline ml-1 text-gray-500" />
            </Typography>
            <Calendar
              mode="multiple"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              modifiers={{ completed: completedDays }}
              modifiersStyles={{
                completed: { color: "white", backgroundColor: '#22c55e', borderRadius: '50%' },
              }}
            />
          </Paper>
        </Box>
      </Box>

      
      {/* === COMPLETED CLASSES SECTION === */}
      <Box mt={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Completed Class History
        </Typography>
        <div className="space-y-4">
          {completedClasses.length > 0 ? (
            completedClasses.map((c) => (
              <Paper key={c._id} className="border-blue-500 border" sx={{ 
                p: 2, 
                borderRadius: 2, 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                justifyContent: 'space-between', bgcolor: '#1f2937' 
              }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">{c.topic}</Typography>
                  {c.homeworkFile && (
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Download size={16} />}
                      href={c.homeworkFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      sx={{
                        mt: 1,
                        p: 0.5,
                        color: 'primary.light',
                        textTransform: 'none'
                      }}
                    >View Homework</Button>
                  )}
                </Box>
                <Box textAlign={{ xs: 'left', sm: 'right' }} sx={{ flexShrink: 0, ml: { xs: 0, sm: 2 }, mt: { xs: 1, sm: 0 } }}>
                  <Typography variant="body2" color="text.secondary">{new Date(c.completedAt).toLocaleDateString()}</Typography>
                  {c.duration && <Typography variant="caption" display="block" color="text.secondary">{c.duration} mins</Typography>}
                </Box>
              </Paper>
            ))
          ) : (
            <Alert severity="info">No classes have been marked as complete for this course yet.</Alert>
          )}
        </div>
      </Box>



      {/* === ADD CLASSES MODAL === */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, bgcolor: '#1f2937' } }}>
        <DialogTitle fontWeight="bold">Add More Classes</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              my: 2,
            }}
          >
            <IconButton onClick={handleDecrease} aria-label="decrease classes">
              <Minus />
            </IconButton>
            <Typography variant="h4" component="span" sx={{ minWidth: "60px", textAlign: "center" }}>
              {classesToAdd}
            </Typography>
            <IconButton onClick={handleIncrease} aria-label="increase classes">
              <Plus />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2 }}>Summary</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Course:</Typography>
              <Typography fontWeight="medium">{course.title}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Price per Class:</Typography>
              <Typography fontWeight="medium">₹{course.perClassPrice.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary">Classes to Add:</Typography>
              <Typography fontWeight="medium">{classesToAdd}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Total:</Typography>
              <Typography variant="h6" fontWeight="bold">₹{totalPrice.toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleProcessPayment}
            variant="contained"
            size="large"
            disabled={isProcessing}
            sx={{ flexGrow: 1, minWidth: { xs: 'auto', sm: '220px' } }}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : `Proceed to Pay ₹${totalPrice.toFixed(2)}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* === MESSAGE MODAL === */}
      {course && (
        <CourseMessageModal
          courseId={course._id}
          open={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
        />
      )}
    </Box>
  );
}
