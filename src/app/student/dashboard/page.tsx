"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookCheck, Hourglass, PlusCircle, BookOpen, Users, Rocket, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

interface DemoClass {
  _id: string;
  teacherId?: {
    fullName: string;
  };
  subject: string;
  bookingDateAndTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  joinLink?: string;
  timeZone?: string;
}

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
          <Skeleton className="h-10 w-64 bg-slate-800 rounded-none" />
          <Skeleton className="h-4 w-80 bg-slate-800 rounded-none" />
        </div>
        <Skeleton className="h-14 w-48 bg-slate-800 rounded-none" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-900/50 rounded-none border border-slate-800" />
        ))}
      </div>

      {/* Content Blocks Skeleton */}
      {[...Array(2)].map((_, sectionIdx) => (
        <div key={sectionIdx} className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40 bg-slate-800 rounded-none" />
            <Skeleton className="h-10 w-32 bg-slate-800 rounded-none" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-900/50 rounded-none border border-slate-800" />
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
        <Alert variant="destructive" className="max-w-md border border-red-500 bg-red-950/20 rounded-none">
          <AlertDescription className="text-lg font-bold text-red-400">
            Access Denied. Please log in to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner - Sharp Edges */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900 p-8 rounded-none border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-slate-400">Welcome back, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                {session?.user?.fullName || 'Student'}! 
              </span>
            </h1>
            <p className="text-base text-slate-400 font-medium flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Ready for another day of learning?
            </p>
          </div>

          <Link href="/get-a-free-trial" className="relative z-10 w-full lg:w-auto">
            <Button className="w-full lg:w-auto text-base py-6 px-8 rounded-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all border border-indigo-400 shadow-md">
              <PlusCircle className="mr-2 h-5 w-5 text-indigo-200" />
              Book New Demo
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Sharp Edges */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Enrolled Courses', value: assignedCourses.length, icon: BookOpen, color: 'cyan' },
            { label: 'Trials Booked', value: demoClasses.length, icon: BookCheck, color: 'purple' },
            { label: 'Confirmed Trials', value: demoClasses.filter(d => d.status === 'confirmed').length, icon: Calendar, color: 'green' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-none hover:border-indigo-500 transition-all relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{stat.label}</span>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-none">
                  <stat.icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div className="text-4xl font-black text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-black text-slate-200 uppercase tracking-wider flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-400" />
              My Learning Path
            </h2>
            <Link href="/student/courses">
              <Button variant="outline" className="text-xs font-black py-4 px-6 rounded-none border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 uppercase tracking-wider">
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignedCourses.length > 0 ? (
              assignedCourses.slice(0, 3).map((course) => (
                <div key={course._id} className="flex flex-col bg-slate-900 border border-slate-800 rounded-none p-6 space-y-6 hover:border-indigo-500 transition-all shadow-md">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-100 tracking-tight leading-snug">
                      {course.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-none border border-slate-800">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Schedule</p>
                        <p className="text-xs font-bold text-slate-300">{course.classDays || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-none border border-slate-800">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Timing</p>
                        <p className="text-xs font-bold text-slate-300">{course.classTime || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Link href={`/student/courses/${course._id}`} className="w-full">
                      <Button className="w-full text-xs font-black uppercase tracking-wider py-5 rounded-none bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white transition-all border border-slate-700">
                        Go to Classroom
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-none p-12 text-center space-y-4">
                <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-300">No courses yet</h3>
                <p className="text-xs text-slate-500">Your enrolled courses will appear here once you start your learning adventure!</p>
              </div>
            )}
          </div>
        </section>

        {/* Trial Classes Section */}
        <section className="space-y-6 pb-12">
          <div className="px-1">
            <h2 className="text-2xl font-black text-slate-200 uppercase tracking-wider flex items-center gap-3">
              <Calendar className="h-6 w-6 text-cyan-400" />
              Trial Classes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demoClasses.length > 0 ? (
              demoClasses.slice(0, 3).map((demo) => (
                <div key={demo._id} className="flex flex-col bg-slate-900 border border-slate-800 rounded-none p-6 space-y-4 hover:border-cyan-500 transition-all shadow-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-extrabold text-slate-100">{demo.subject}</h3>
                    <Badge className="px-3 py-1 rounded-none font-black uppercase text-[10px] border bg-slate-950 text-slate-300 border-slate-700">
                      {demo.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950 rounded-none border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-black uppercase">Date</p>
                      <p className="text-xs font-bold text-slate-300">{new Date(demo.bookingDateAndTime).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-none border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-black uppercase">Time</p>
                      <p className="text-xs font-bold text-slate-300">
                        {demo.status === 'confirmed' ? new Date(demo.bookingDateAndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    {demo.status === 'confirmed' && demo.joinLink ? (
                      <Link href={demo.joinLink} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full text-xs font-black uppercase tracking-wider py-5 rounded-none bg-cyan-600 hover:bg-cyan-500 text-white transition-all border border-cyan-400">
                          Join Class
                        </Button>
                      </Link>
                    ) : (
                      <Button className="w-full text-xs font-black uppercase tracking-wider py-5 rounded-none bg-slate-950 text-slate-600 border border-slate-800 opacity-60" disabled>
                        {demo.status === 'pending' ? 'Preparing Link...' : 'Scheduled'}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-none p-12 text-center space-y-4">
                <Rocket className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-300">No free trials booked</h3>
                <Link href="/get-a-free-trial" className="inline-block mt-2">
                  <Button variant="outline" className="text-xs font-black py-4 px-6 rounded-none border border-cyan-500 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-900/40 uppercase">
                    Book Free Trial
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
