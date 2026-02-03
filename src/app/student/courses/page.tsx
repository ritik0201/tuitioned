"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@mui/material";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="container mx-auto px-4 py-6 md:py-0">
      <Skeleton className="h-10 w-64 mx-auto mb-6 md:mb-10 bg-gray-800" />

      <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-4">
        <div className="w-full lg:w-7/12">
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full rounded-2xl flex flex-col md:flex-row overflow-hidden bg-gray-800 border-blue-500 border-2"
                >
                  <div className="flex flex-col justify-between p-6 md:p-8 flex-1">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2 sm:gap-0">
                        <Skeleton className="h-8 w-48 bg-gray-700" />
                        <Skeleton className="h-6 w-24 rounded-full bg-gray-700" />
                      </div>

                      <Skeleton className="h-4 w-20 bg-gray-700 mb-4" />
                    </div>

                    <div className="mt-4 md:mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-32 bg-gray-700" />
                      </div>
                    </div>

                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <Skeleton className="h-4 w-full bg-gray-700" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-4/12 bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg self-start lg:sticky lg:top-24 border-blue-500 border-2">
          <Skeleton className="h-8 w-40 mb-6 bg-gray-700" />
          <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-700" />
          <Skeleton className="h-6 w-48 mx-auto mb-2 bg-gray-700" />
          <Skeleton className="h-4 w-64 mx-auto mb-6 bg-gray-700" />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded-lg text-center flex flex-col items-center justify-center h-24">
               <Skeleton className="h-8 w-8 bg-gray-700 mb-2" />
               <Skeleton className="h-3 w-20 bg-gray-700" />
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center flex flex-col items-center justify-center h-24">
               <Skeleton className="h-8 w-8 bg-gray-700 mb-2" />
               <Skeleton className="h-3 w-20 bg-gray-700" />
            </div>
          </div>

          <div className="mt-auto">
            <Skeleton className="h-12 w-full rounded-lg bg-gray-700" />
          </div>
        </div>
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
        // Replace this endpoint with your API route that fetches courses dynamically
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

  if (loading) return <CoursesSkeleton />;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="container mx-auto px-4 py-6 md:py-0">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-10 text-white">
        Your Enrolled Courses
      </h1>

      <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-4">
        <div className="w-full lg:w-7/12">
          {courses.length > 0 ? (
            <div className="flex flex-col gap-8">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  href={`/student/courses/${course._id}`}
                  className="w-full rounded-2xl shadow-lg hover:shadow-primary/20 hover:shadow-2xl duration-300 flex flex-col md:flex-row overflow-hidden bg-gray-800 border-blue-500 border-2"
                >
                  <div className="flex flex-col justify-between p-6 md:p-8 flex-1">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2 sm:gap-0">
                        <h2 className="text-2xl md:text-3xl font-semibold text-card-foreground">
                          {course.title}
                        </h2>
                        <span
                          className={`px-4 py-1 text-sm font-medium rounded-full ${
                            course.noOfClasses > 0
                              ? "bg-green-600/20 text-green-400"
                              : "bg-yellow-600/20 text-yellow-400"
                          }`}
                        >
                          {course.noOfClasses > 0 ? "Running" : "Pending"}
                        </span>
                      </div>

                      <p className="text-muted-foreground mb-4">{course.grade} Grade</p>
                    </div>

                    <div className="mt-4 md:mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <p>
                          <span className="font-semibold text-foreground">Teacher:</span>{" "}
                          {course.teacherName || "Not Assigned"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Class Time:
                          </span>{" "}
                          {course.classTime || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Class Days:
                          </span>{" "}
                          {course.classDays?.join(", ") || "N/A"}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Total Classes:
                          </span>{" "}
                          {course.noOfClasses}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-border pt-4">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Alert severity="info">You are not enrolled in any courses yet.</Alert>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-4/12 bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg self-start lg:sticky lg:top-24 lg:min-h-screen border-blue-500 border-2">
          <h3 className="text-2xl font-bold text-white mb-6">Your Progress</h3>
          <Image
            src="/courses.jpg"
            alt="Student Illustration"
            className="w-32 mx-auto mb-4"
            width={128}
            height={128}
          />
          <h4 className="font-semibold text-xl text-blue-400">Keep up the great work!</h4>
          <p className="text-sm text-blue-300 mt-1 mb-6">Here's a summary of your learning journey.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-indigo-400">{courses.length}</p>
              <p className="text-sm text-gray-400 mt-1">Total Courses</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">
                {courses.filter(c => c.paymentStatus === 'completed').length}
              </p>
              <p className="text-sm text-gray-400 mt-1">Completed</p>
            </div>
          </div>

          <div className="mt-auto">
            <a
              href="/get-a-free-trial"
              className="block w-full text-center py-3 rounded-lg font-semibold transition-all duration-300 bg-[#0EA5E9] hover:bg-[#0284c7] text-white border-white border-2"
            >
              Book a Free Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
