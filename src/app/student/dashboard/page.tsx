"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookCheck, Hourglass, PlusCircle, BookOpen, Users, Rocket, Sparkles, Target, Trophy, Lightbulb, RotateCcw, Star } from 'lucide-react';
import Link from 'next/link';

// Define the type for the demo class data we expect from the API
interface DemoClass {
  _id: string;
  teacherId?: {
    fullName: string;
  };
  subject: string;
  bookingDateAndTime: string; // Dates will be strings in JSON
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  joinLink?: string;
  timeZone?: string;
}

// Define the type for the assigned course data
interface AssignedCourse {
  _id: string;
  title: string;
  classTime: string;
  classDays: string;
  joinLink: string;
  classroomLink?: string;
  paymentStatus: 'completed' | 'pending';
}

function DashboardSkeleton() {
  return (
    <div className='w-full space-y-10 animate-pulse'>
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 bg-slate-800 rounded-xl" />
          <Skeleton className="h-4 w-80 bg-slate-800 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-48 bg-slate-800 rounded-2xl" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/50 rounded-[2rem] border-2 border-slate-800" />
        ))}
      </div>

      {/* Content Blocks Skeleton */}
      {[...Array(2)].map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40 bg-slate-800 rounded-lg" />
            <Skeleton className="h-10 w-32 bg-slate-800 rounded-xl" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-900/50 rounded-[2rem] border-2 border-slate-800" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch('/api/demoClass').then(res => res.json()),
        fetch('/api/student-courses').then(res => res.json())
      ])
      .then(([demoData, courseData]) => {
        setDemoClasses(demoData || []);
        setAssignedCourses(courseData || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md border-2 border-red-500 bg-red-950/20 rounded-2xl">
          <AlertDescription className="text-lg font-bold text-red-400">
            Access Denied. Please log in to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 bg-slate-900/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
          
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-slate-400">Welcome back, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 block sm:inline">
                {session?.user?.fullName || 'Student'}! 
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 font-medium flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Ready for another day of learning?
            </p>
          </div>

          <Link href="/get-a-free-trial" className="relative z-10 w-full lg:w-auto">
            <Button className="w-full lg:w-auto text-lg sm:text-xl py-6 sm:py-7 px-8 sm:px-10 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-[0_8px_0_rgba(67,56,202,1)] hover:shadow-[0_4px_0_rgba(67,56,202,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-indigo-400">
              <PlusCircle className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-indigo-200" />
              Book New Demo
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Enrolled Courses', value: assignedCourses.length, icon: BookOpen, color: 'cyan' },
            { label: 'Trials Booked', value: demoClasses.length, icon: BookCheck, color: 'purple' },
            { label: 'Confirmed Trials', value: demoClasses.filter(d => d.status === 'confirmed').length, icon: Calendar, color: 'green' }
          ].map((stat, i) => (
            <div key={i} className={`bg-slate-900 border-b-4 border-r-4 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-${stat.color}-500/50 hover:border-${stat.color}-400 transition-all group relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="h-20 w-20 sm:h-24 sm:w-24" />
              </div>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <span className={`text-base sm:text-lg font-bold text-${stat.color}-400 uppercase tracking-widest`}>{stat.label}</span>
                <div className={`p-2 sm:p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/30`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${stat.color}-400`} />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <h2 className="text-3xl font-extrabold text-slate-200 flex items-center gap-3">
              <Target className="h-8 w-8 text-indigo-400" />
              My Learning Path
            </h2>
            <Link href="/student/courses">
              <Button variant="outline" className="text-lg py-6 px-8 rounded-xl border-2 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold hover:border-indigo-500/50 transition-all">
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {assignedCourses.length > 0 ? (
              assignedCourses.slice(0, 3).map((course) => (
                <div key={course._id} className="group flex flex-col bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-1 overflow-hidden hover:border-indigo-500/50 transition-all shadow-xl">
                  <div className="p-8 space-y-6 flex-1 bg-slate-900/40 rounded-[2.25rem]">
                    <div className="space-y-2">
                      <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-2xl font-bold text-slate-100 tracking-tight leading-snug">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Schedule</p>
                          <p className="text-sm font-bold text-slate-300">{course.classDays || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Timing</p>
                          <p className="text-sm font-bold text-slate-300">{course.classTime || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-2">
                    <Link href={`/student/courses/${course._id}`} className="w-full">
                      <Button className="w-full text-lg py-7 rounded-2xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold transition-all border-2 border-slate-700 hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        Go to Classroom
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-slate-900/50 border-4 border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center space-y-6">
                <div className="p-6 bg-slate-950 rounded-full inline-block border-2 border-slate-800">
                  <BookOpen className="h-12 w-12 text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-300">No courses yet</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Your enrolled courses will appear here once you start your learning adventure!</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Trial Classes Section */}
        <section className="space-y-6 pb-20">
          <div className="px-2">
            <h2 className="text-3xl font-extrabold text-slate-200 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-cyan-400" />
              Trial Classes
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {demoClasses.length > 0 ? (
              demoClasses.slice(0, 3).map((demo) => (
                <div key={demo._id} className="group flex flex-col bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-1 overflow-hidden hover:border-cyan-500/50 transition-all shadow-xl">
                  <div className="p-8 space-y-6 flex-1 bg-slate-900/40 rounded-[2.25rem]">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="w-12 h-1 bg-cyan-500 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{demo.subject}</h3>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] border-2 ${
                        demo.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {demo.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                        <Users className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Instructor</p>
                        <p className="text-sm font-bold text-slate-300 truncate max-w-[150px]">
                          {demo.teacherId?.fullName || 'Allocating...'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                        <Calendar className="h-4 w-4 text-cyan-400 mb-2" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Date</p>
                        <p className="text-sm font-bold text-slate-300">{new Date(demo.bookingDateAndTime).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                        <Clock className="h-4 w-4 text-purple-400 mb-2" />
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Time</p>
                        <p className="text-sm font-bold text-slate-300">
                          {demo.status === 'confirmed' ? new Date(demo.bookingDateAndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-2">
                    {demo.status === 'confirmed' && demo.joinLink ? (
                      <Link href={demo.joinLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full text-lg py-7 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-[0_8px_0_rgba(8,145,178,1)] hover:shadow-[0_4px_0_rgba(8,145,178,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 border-2 border-cyan-400">
                          Join Class
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full text-lg py-7 rounded-2xl bg-slate-800 text-slate-500 font-bold border-2 border-slate-700 opacity-50 cursor-not-allowed" disabled>
                        {demo.status === 'pending' ? 'Preparing Link...' : 'Class Scheduled'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-slate-900/50 border-4 border-dashed border-slate-800 rounded-[2.5rem] p-20 text-center space-y-6">
                 <div className="p-6 bg-slate-950 rounded-full inline-block border-2 border-slate-800">
                  <Rocket className="h-12 w-12 text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-300">No free trials booked</h3>
                  <p className="text-slate-500 mb-6">Start your journey with a free demo class today!</p>
                  <Link href="/get-a-free-trial" className="inline-block mt-4">
                    <Button variant="outline" className="text-lg py-6 px-10 rounded-xl border-2 border-cyan-500 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 font-bold">
                      Book Free Trial
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

