"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, notFound, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  Download,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Layout,
  Target,
  Sparkles
} from "lucide-react";
import Calendar from "@/components/lightswind/calendar";
import { toast } from "sonner";
import CourseMessageModal from "@/components/CourseMessageModal";
import { type RazorpayOptions } from "@/types/global";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface ICourse {
  _id: string;
  studentId: string;
  title: string;
  description: string;
  grade: string;
  classTime?: string;
  classDays?: string[];
  noOfClasses: number;
  perClassPrice: number;
  joinLink?: string;
  classroomLink?: string;
  paymentStatus?: "pending" | "completed" | "failed";
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

function CourseDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
      <Skeleton className="h-10 w-32 bg-slate-800 rounded-xl" />
      <Skeleton className="h-24 w-full bg-slate-800 rounded-[2rem]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] w-full bg-slate-800 rounded-[2.5rem]" />
          <Skeleton className="h-[300px] w-full bg-slate-800 rounded-[2.5rem]" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[250px] w-full bg-slate-800 rounded-[2.5rem]" />
          <Skeleton className="h-[250px] w-full bg-slate-800 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}

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
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [classesToAdd, setClassesToAdd] = useState(6);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClassesToAdd(6);
  };

  const handleIncrease = () => setClassesToAdd((prev) => prev + 1);
  const handleDecrease = () => setClassesToAdd((prev) => Math.max(6, prev - 1));

  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
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

    const retry = searchParams.get('retry');
    const classes = searchParams.get('classes');
    if (retry === 'true' && classes) {
      const numClasses = parseInt(classes, 10);
      if (!isNaN(numClasses) && numClasses > 0) {
        setClassesToAdd(Math.max(6, numClasses));
        handleOpenModal();
      }
    }
  }, [courseId, searchParams]);

  const handleProcessPayment = async () => {
    if (!session?.user || !course) {
      toast.error("Please login to proceed.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: `rec_${course._id}_${Date.now() % 10000000}`,
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.message || "Failed to create order.");

      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          amount: totalPrice,
          numberOfClasses: classesToAdd,
          currency: order.currency,
          transactionId: order.id,
          paymentGateway: 'Razorpay',
        }),
      });

      const options: RazorpayOptions & { modal: { ondismiss: () => void } } = {
        key: process.env.NEXT_PUBLIC_RP_KEY_ID ?? "",
        amount: order.amount,
        currency: order.currency,
        name: "Tuition ED",
        description: `Adding ${classesToAdd} classes to ${course.title}`,
        order_id: order.id,
        handler: async function (response) {
          const updateRes = await fetch("/api/student-courses/update-classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              classesToAdd,
              currentClasses: course.noOfClasses,
              paymentStatus: 'completed',
            }),
          });

          if (updateRes.ok) {
            await fetch('/api/transactions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: response.razorpay_order_id, status: 'completed' }),
            });
            toast.success("Success! Your course has been updated.");
            router.refresh();
            handleCloseModal();
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
            await fetch('/api/transactions', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: order.id, status: 'failed' }),
            });
          },
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950"><CourseDetailSkeleton /></div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex p-8"><Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert></div>;
  if (!course) return notFound();

  const totalPrice = classesToAdd * course.perClassPrice;
  const completedDays = completedClasses.map(c => new Date(c.completedAt));
  const completedClassesCount = completedClasses.length;
  const remainingClassesCount = course.noOfClasses;
  const totalCourseClasses = remainingClassesCount + completedClassesCount;
  const completionPercentage = totalCourseClasses > 0 ? (completedClassesCount / totalCourseClasses) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 md:py-12 px-4 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group hover:bg-slate-900 text-slate-400 hover:text-indigo-400 rounded-xl transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </Button>

        {/* Management Bar */}
        <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-xl border-4 border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
                <Layout className="h-8 w-8 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">Course Management</h3>
                <p className="text-slate-400 text-sm font-medium">Manage your enrollment and progress.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="text-center px-6 py-2 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Remaining</p>
                <p className="text-2xl font-black text-indigo-400">{remainingClassesCount}</p>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 sm:h-16 px-6 sm:px-10 text-base sm:text-lg rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-[0_6px_0_rgba(67,56,202,1)] hover:shadow-[0_3px_0_rgba(67,56,202,1)] hover:translate-y-[3px] transition-all border-2 border-indigo-400">
                    <PlusCircle className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    Add More Classes
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-8 max-w-md shadow-2xl">
                  <DialogHeader className="space-y-2 text-center">
                    <DialogTitle className="text-2xl font-bold text-white">Add Classes</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select how many additional classes you would like to add for <span className="text-indigo-400 font-semibold">{course.title}</span>.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-8 space-y-6">
                    <div className="flex items-center justify-center gap-6">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleDecrease} 
                        className="h-12 w-12 rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      
                      <div className="text-center min-w-[80px]">
                        <span className="text-5xl font-bold text-white">
                          {classesToAdd}
                        </span>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Classes</p>
                      </div>

                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleIncrease} 
                        className="h-12 w-12 rounded-xl bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price per class</p>
                        <p className="text-sm font-medium text-slate-300">₹{course.perClassPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Payment</p>
                        <p className="text-2xl font-bold text-white">₹{totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      disabled={isProcessing}
                      onClick={handleProcessPayment}
                      className="w-full h-14 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          <span>Confirm Payment</span>
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 border-4 border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mb-48 -mr-48 blur-3xl"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4">
                  <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-2 ${
                    remainingClassesCount > 0 ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  }`}>
                    {remainingClassesCount > 0 ? "Status: Active" : "Status: Inactive"}
                  </Badge>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                    {course.title}
                  </h1>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-black text-slate-300">Grade {course.grade}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 transition-colors hover:border-indigo-500/30 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 group-hover:scale-110 transition-transform">
                        <IndianRupee className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pricing</p>
                        <p className="text-lg font-black tracking-tight text-white">₹{course.perClassPrice} <span className="text-xs text-slate-500">/ Class</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 transition-colors hover:border-purple-500/30 group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">
                        <CalendarIcon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {course.classDays?.map(day => (
                          <span key={day} className="text-[10px] font-black uppercase italic text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{day}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-xl font-black italic text-slate-200">
                    <Info className="h-5 w-5 text-indigo-400" />
                    Course Description
                  </h4>
                  <p className="text-slate-400 font-medium leading-relaxed text-lg">
                    {course.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Circle - Moved from sidebar to fill gaps and show prominence */}
            <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mt-16 -mr-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black italic text-slate-100 tracking-tight flex items-center justify-center md:justify-start gap-3">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                    Overall Progression
                  </h3>
                  <p className="text-slate-400 font-medium max-w-xs">Track your journey through this course. Each lesson brings you closer to mastery.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Completed</p>
                      <p className="text-2xl font-black text-green-400">{completedClassesCount}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total</p>
                      <p className="text-2xl font-black text-indigo-400">{totalCourseClasses}</p>
                    </div>
                  </div>
                </div>

                <div className="relative inline-flex items-center justify-center w-40 h-40 rounded-full border-[10px] border-slate-800 border-t-indigo-500 border-l-indigo-500 -rotate-45 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <div className="rotate-45 flex flex-col items-center">
                    <span className="text-4xl font-black text-white">{Math.round(completionPercentage)}%</span>
                    <span className="text-xs font-black uppercase text-slate-500 tracking-tighter">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson History */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic tracking-tight text-slate-100 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
                Lesson History
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedClasses.length > 0 ? (
                  completedClasses.map((c) => (
                    <div key={c._id} className="p-6 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] hover:border-indigo-500/50 transition-all group overflow-hidden relative shadow-xl">
                      <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
                        <Layout className="h-20 w-20 text-indigo-400" />
                      </div>
                      <div className="relative z-10 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <div className="h-1 w-4 bg-indigo-500 rounded-full"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                               {new Date(c.completedAt).toLocaleDateString()}
                             </p>
                          </div>
                          <h4 className="text-lg font-bold text-slate-100">{c.topic}</h4>
                        </div>
                        {c.homeworkFile && (
                          <Button 
                            variant="ghost" 
                            className="w-full h-10 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-400 font-bold italic rounded-xl flex items-center justify-center gap-2"
                            asChild
                          >
                            <a href={c.homeworkFile} target="_blank" rel="noopener noreferrer">
                              <Download className="h-3 w-3" />
                              Homework
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center bg-slate-900/50 border-4 border-dashed border-slate-800 rounded-[2.5rem]">
                    <Clock className="h-12 w-12 text-slate-700 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-500 font-bold italic">No lessons recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Instructor & Actions */}
          <div className="space-y-8">
            <div className="bg-slate-900 border-4 border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-fit">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mt-16 -mr-16 blur-2xl"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-black italic text-slate-100 tracking-tight flex items-center gap-3">
                    <Target className="h-6 w-6 text-purple-400" />
                    Course Instructor
                  </h3>
                  
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 text-center space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl mx-auto flex items-center justify-center p-2">
                       <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                          <span className="text-3xl font-black text-white italic">{course.teacherName?.charAt(0) || "S"}</span>
                       </div>
                    </div>
                    <div>
                      <p className="text-lg font-black text-white">{course.teacherName || "Name Pending"}</p>
                      <p className="text-xs font-black uppercase text-slate-500 tracking-widest mt-1">Lead Teacher</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-center gap-3">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-black text-slate-300">{course.classTime || "Time Pending"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsMessageModalOpen(true)}
                    className="w-full h-14 bg-slate-950/50 border-2 border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white rounded-2xl transition-all font-black flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                    Send Message
                  </Button>
                  
                  <Link href={course.joinLink || "#"} className={!course.joinLink || remainingClassesCount <= 0 ? 'pointer-events-none' : ''}>
                    <Button 
                      disabled={!course.joinLink || remainingClassesCount <= 0}
                      className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black shadow-[0_6px_0_rgba(16,185,129,0.5)] active:translate-y-[4px] active:shadow-none transition-all border-2 border-emerald-400/50 rounded-2xl flex items-center justify-center gap-3 text-lg"
                    >
                      <Video className="h-6 w-6" />
                      Join Class
                    </Button>
                  </Link>

                  <Link href={course.classroomLink || "#"} className={!course.classroomLink || remainingClassesCount <= 0 ? 'pointer-events-none' : ''}>
                    <Button 
                      variant="ghost"
                      disabled={!course.classroomLink || remainingClassesCount <= 0}
                      className="w-full h-14 bg-slate-800/20 border-2 border-slate-800/50 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 rounded-2xl transition-all font-black flex items-center justify-center gap-2"
                    >
                      Course Materials
                      <Layout className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Calendar - Moved from below progress to below instructor */}
            <div className="bg-slate-900 border-4 border-slate-800 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <h3 className="text-xl font-black italic text-slate-100 tracking-tight flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-cyan-400" />
                Upcoming Classes
              </h3>
              
              <div className="flex items-center justify-center overflow-hidden">
                <div className="max-w-[280px] sm:max-w-md w-full">
                  <Calendar
                    mode="multiple"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    modifiers={{ completed: completedDays }}
                    className="p-0 border-none mx-auto w-full"
                    modifiersStyles={{
                      completed: { color: "#fff", backgroundColor: '#6366f1', borderRadius: '50%', fontWeight: 'bold' },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CourseMessageModal 
        open={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)} 
        courseId={course._id} 
      />
    </div>
  );
}
