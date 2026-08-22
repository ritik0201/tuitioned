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
      <Skeleton className="h-10 w-32 bg-slate-800 rounded-none" />
      <Skeleton className="h-24 w-full bg-slate-800 rounded-none" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] w-full bg-slate-800 rounded-none" />
          <Skeleton className="h-[300px] w-full bg-slate-800 rounded-none" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-[250px] w-full bg-slate-800 rounded-none" />
          <Skeleton className="h-[250px] w-full bg-slate-800 rounded-none" />
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group hover:bg-slate-900 text-slate-400 hover:text-indigo-400 rounded-none transition-all border border-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </Button>

        {/* Management Bar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-none shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-none">
              <Layout className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-wider">Course Management</h3>
              <p className="text-slate-400 text-xs font-medium">Manage your enrollment and progress.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="text-center px-5 py-2 bg-slate-950 border border-slate-800 rounded-none">
              <p className="text-[10px] uppercase font-black text-slate-500">Remaining</p>
              <p className="text-xl font-black text-indigo-400">{remainingClassesCount}</p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 text-xs font-black uppercase tracking-wider rounded-none bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add More Classes
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border border-slate-700 rounded-none p-6 max-w-md shadow-2xl">
                <DialogHeader className="space-y-2 text-center">
                  <DialogTitle className="text-xl font-black uppercase text-white">Add Classes</DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs">
                    Select how many additional classes you would like to add for <span className="text-indigo-400 font-bold">{course.title}</span>.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleDecrease} 
                      className="h-10 w-10 rounded-none bg-slate-950 border-slate-700 hover:bg-slate-800 text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-center min-w-[70px]">
                      <span className="text-4xl font-black text-white">{classesToAdd}</span>
                      <p className="text-[10px] uppercase font-black text-slate-500 mt-0.5">Classes</p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleIncrease} 
                      className="h-10 w-10 rounded-none bg-slate-950 border-slate-700 hover:bg-slate-800 text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-none border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase">Price per class</p>
                      <p className="text-xs font-bold text-slate-300">₹{course.perClassPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 uppercase">Total</p>
                      <p className="text-xl font-black text-white">₹{totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    disabled={isProcessing}
                    onClick={handleProcessPayment}
                    className="w-full h-12 text-xs font-black uppercase tracking-wider rounded-none bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? "Processing..." : "Confirm Payment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-none shadow-xl space-y-6">
              <div className="space-y-2">
                <Badge className="px-3 py-1 rounded-none font-black text-[10px] uppercase border bg-slate-950 text-emerald-400 border-emerald-500/40">
                  {remainingClassesCount > 0 ? "Active" : "Inactive"}
                </Badge>
                <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                  {course.title}
                </h1>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-none text-xs font-black text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-cyan-400" /> Grade {course.grade}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-none border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-500">Pricing</p>
                  <p className="text-base font-black text-white">₹{course.perClassPrice} / Class</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-none border border-slate-800">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Days</p>
                  <div className="flex flex-wrap gap-1">
                    {course.classDays?.map(day => (
                      <span key={day} className="text-[10px] font-black uppercase text-purple-300 bg-purple-950 px-2 py-0.5 border border-purple-800">{day}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase text-slate-300 flex items-center gap-2">
                  <Info className="h-4 w-4 text-indigo-400" /> Course Overview
                </h4>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Lesson History */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" /> Lesson History
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedClasses.length > 0 ? (
                  completedClasses.map((c) => (
                    <div key={c._id} className="p-4 bg-slate-900 border border-slate-800 rounded-none space-y-2">
                      <p className="text-[10px] font-black uppercase text-indigo-400">
                        {new Date(c.completedAt).toLocaleDateString()}
                      </p>
                      <h4 className="text-sm font-bold text-slate-100">{c.topic}</h4>
                      {c.homeworkFile && (
                        <Button 
                          variant="ghost" 
                          className="w-full h-8 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-indigo-400 font-bold text-xs rounded-none flex items-center justify-center gap-1"
                          asChild
                        >
                          <a href={c.homeworkFile} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3 w-3" /> Homework
                          </a>
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-none">
                    <p className="text-slate-500 text-xs font-bold uppercase">No lessons recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-none space-y-6">
              <h3 className="text-lg font-black uppercase text-slate-100 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" /> Instructor
              </h3>
              
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-none text-center space-y-2">
                <p className="text-base font-black text-white">{course.teacherName || "Name Pending"}</p>
                <p className="text-[10px] font-black uppercase text-slate-500">Lead Teacher</p>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsMessageModalOpen(true)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-none font-black text-xs uppercase"
                >
                  <MessageSquare className="h-4 w-4 text-indigo-400 mr-2" /> Send Message
                </Button>
                
                <Link href={course.joinLink || "#"} className={!course.joinLink || remainingClassesCount <= 0 ? 'pointer-events-none' : ''}>
                  <Button 
                    disabled={!course.joinLink || remainingClassesCount <= 0}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs rounded-none border border-emerald-400 flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" /> Join Class
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-none space-y-4">
              <h3 className="text-base font-black uppercase text-slate-100 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-cyan-400" /> Calendar
              </h3>
              <div className="flex items-center justify-center">
                <Calendar
                  mode="multiple"
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  modifiers={{ completed: completedDays }}
                  className="p-0 border-none mx-auto w-full"
                  modifiersStyles={{
                    completed: { color: "#fff", backgroundColor: '#6366f1', borderRadius: '0px', fontWeight: 'bold' },
                  }}
                />
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
