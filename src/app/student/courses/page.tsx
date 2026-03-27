"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Users, Calendar, Clock, GraduationCap, ArrowRight, Target, Sparkles, Rocket, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ICourse {
  _id: string;
  title: string;
  description: string;
  grade: string;
  classTime: string;
  classDays: string[];
  noOfClasses: number;
  perClassPrice: number;
  studentId: string;
  teacherId: string;
  teacherName?: string;
  paymentStatus?: string;
  classroomLink?: string;
  joinLink?: string;
}

function CoursesSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-12 animate-pulse">
      <Skeleton className="h-12 w-80 mx-auto bg-slate-800 rounded-2xl" />

      <div className="flex flex-col lg:flex-row w-full gap-8">
        <div className="w-full lg:w-8/12 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-[2.5rem] border-4 border-slate-800" />
          ))}
        </div>
        <div className="w-full lg:w-4/12 h-[500px] bg-slate-900/50 rounded-[2.5rem] border-4 border-slate-800 sticky top-24" />
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/student-courses");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch courses.");
        }
        const data: ICourse[] = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950">
      <CoursesSkeleton />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md border-2 border-red-500 bg-red-950/20 rounded-2xl">
        <AlertDescription className="text-lg font-bold text-red-400">
          {error}
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            Your Academy
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 leading-tight">
            My Learning Journey
          </h1>
          <p className="text-base sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto px-4">
            Explore your active courses and track your progress through the stars! 
          </p>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-10">
          {/* Main Content Area */}
          <div className="w-full lg:w-8/12">
            {courses.length > 0 ? (
              <div className="grid gap-6 md:gap-8">
                {courses.map((course) => (
                  <div key={course._id} className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.1rem] sm:rounded-[2.6rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <Link
                      href={`/student/courses/${course._id}`}
                      className="relative block w-full bg-slate-900 border-4 border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500"
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        {/* Course Content */}
                        <div className="flex-1 p-6 sm:p-8 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="h-1.5 sm:h-2 w-8 sm:w-10 bg-indigo-500 rounded-full"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                  {course.grade} Grade
                                </span>
                              </div>
                              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 tracking-tight group-hover:text-indigo-300 transition-colors">
                                {course.title}
                              </h2>
                            </div>
                            <Badge className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full font-bold text-[8px] sm:text-[10px] uppercase tracking-widest border-2 ${
                              course.noOfClasses > 0 
                                ? "bg-green-500/10 text-green-400 border-green-500/30" 
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                            }`}>
                              {course.noOfClasses > 0 ? "Active Course" : "Registration Pending"}
                            </Badge>
                          </div>

                          <p className="text-slate-400 line-clamp-2 font-medium leading-relaxed">
                            {course.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                              <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Users className="h-4 w-4 text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instructor</p>
                                <p className="text-sm font-bold text-slate-200 truncate">{course.teacherName || "Scouting..."}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                              <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Clock className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Timing</p>
                                <p className="text-sm font-bold text-slate-200">{course.classTime || "Pending"}</p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-400">{course.noOfClasses} Classes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span className="text-xs font-bold text-slate-400">{course.classDays?.length || 0} Days/Week</span>
                              </div>
                            </div>
                            <div className="text-indigo-400 group-hover:translate-x-2 transition-transform">
                              <ArrowRight className="h-6 w-6" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 shadow-2xl rounded-[3rem] border-4 border-dashed border-slate-800 p-20 text-center space-y-8">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  <div className="relative p-8 bg-slate-950 rounded-full border-4 border-slate-800 shadow-2xl">
                    <Rocket className="h-16 w-16 text-slate-700" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-200">No active courses found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-lg font-medium">
                    Your learning journey hasn't started yet. Let's book your first trial class!
                  </p>
                  <Link href="/get-a-free-trial" className="inline-block pt-6">
                    <Button className="text-xl py-8 px-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-[0_8px_0_rgba(67,56,202,1)] hover:shadow-[0_4px_0_rgba(67,56,202,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-indigo-400">
                      Book Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Progress Section */}
          <aside className="w-full lg:w-4/12 space-y-8">
            <div className="bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-8 sticky top-24 shadow-2xl space-y-8 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-100 flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                    Achievements
                  </h3>
                  <p className="text-slate-400 text-sm font-medium">Tracking your cosmic progress.</p>
                </div>

                  <div className="relative py-6 sm:py-10 flex justify-center">
                    <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <Image
                      src="/courses.jpg"
                      alt="Success"
                      className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-3xl shadow-2xl border-2 border-slate-800 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                      width={160}
                      height={160}
                    />
                  </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group/card">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Paths</p>
                        <p className="text-3xl font-black text-indigo-400 group-hover/card:scale-110 transition-transform origin-left">{courses.length}</p>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
                        <Target className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group/card">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Courses Completed</p>
                        <p className="text-3xl font-black text-green-400 group-hover/card:scale-110 transition-transform origin-left">
                          {courses.filter(c => c.paymentStatus === 'completed').length}
                        </p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/30">
                        <CheckCircle2 className="h-6 w-6 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-500/5 rounded-3xl border-2 border-indigo-500/20 text-center space-y-3">
                    <p className="text-sm font-bold text-indigo-300">New Course Available!</p>
                    <Link href="/get-a-free-trial" className="block">
                      <Button className="w-full text-base py-6 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-black shadow-[0_4px_0_rgba(148,163,184,1)] hover:translate-y-[2px] active:translate-y-1 active:shadow-none transition-all">
                        Book Free Demo
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-slate-500 group/item">
                    <Sparkles className="h-4 w-4 text-yellow-500/50 group-hover/item:text-yellow-400 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-widest">Keep shining brightest!</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

