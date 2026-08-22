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
      <Skeleton className="h-12 w-80 mx-auto bg-slate-800 rounded-none" />

      <div className="flex flex-col lg:flex-row w-full gap-8">
        <div className="w-full lg:w-8/12 space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900/50 rounded-none border-2 border-slate-800" />
          ))}
        </div>
        <div className="w-full lg:w-4/12 h-[500px] bg-slate-900/50 rounded-none border-2 border-slate-800 sticky top-24" />
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
      <Alert variant="destructive" className="max-w-md border border-red-500 bg-red-950/20 rounded-none">
        <AlertDescription className="text-lg font-bold text-red-400">
          {error}
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-black text-xs uppercase tracking-widest rounded-none">
            <GraduationCap className="h-4 w-4" />
            Your Academy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            My Learning Journey
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-medium max-w-xl mx-auto">
            Explore your active courses and track your academic progress!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row w-full gap-8">
          {/* Main List */}
          <div className="w-full lg:w-8/12">
            {courses.length > 0 ? (
              <div className="grid gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="group relative">
                    <Link
                      href={`/student/courses/${course._id}`}
                      className="relative block w-full bg-slate-900 border border-slate-800 rounded-none overflow-hidden hover:border-indigo-500 transition-all p-6 space-y-4 shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">
                            {course.grade} Grade
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-100 group-hover:text-indigo-400 transition-colors">
                            {course.title}
                          </h2>
                        </div>
                        <Badge className={`px-3 py-1 rounded-none font-black text-[10px] uppercase tracking-widest border ${
                          course.noOfClasses > 0 
                            ? "bg-slate-950 text-green-400 border-green-500/40" 
                            : "bg-slate-950 text-yellow-400 border-yellow-500/40"
                        }`}>
                          {course.noOfClasses > 0 ? "Active Course" : "Pending"}
                        </Badge>
                      </div>

                      <p className="text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-none border border-slate-800">
                          <Users className="h-4 w-4 text-indigo-400" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Instructor</p>
                            <p className="text-xs font-bold text-slate-200 truncate">{course.teacherName || "Allocating..."}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-none border border-slate-800">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Timing</p>
                            <p className="text-xs font-bold text-slate-200">{course.classTime || "Pending"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <span>{course.noOfClasses} Classes</span>
                          <span>{course.classDays?.length || 0} Days/Wk</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-none p-12 text-center space-y-4">
                <Rocket className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-2xl font-black text-slate-200">No active courses found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your learning journey hasn't started yet. Let's book your first trial class!
                </p>
                <Link href="/get-a-free-trial" className="inline-block pt-2">
                  <Button className="text-xs font-black uppercase py-4 px-8 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400">
                    Book Free Trial
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-4/12 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-none p-6 space-y-6 sticky top-24">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  Achievements
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-950 p-4 rounded-none border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Active Paths</p>
                    <p className="text-2xl font-black text-indigo-400">{courses.length}</p>
                  </div>
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="bg-slate-950 p-4 rounded-none border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Completed</p>
                    <p className="text-2xl font-black text-green-400">
                      {courses.filter(c => c.paymentStatus === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-indigo-500/30 text-center space-y-2">
                <p className="text-xs font-bold text-indigo-300">Need a new course?</p>
                <Link href="/get-a-free-trial" className="block">
                  <Button className="w-full text-xs font-black uppercase py-3 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400">
                    Book Free Demo
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
