import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import User from "@/models/User";
import CompletedClass from "@/models/CompletedClass";
import { Types } from "mongoose";

interface LeanCourse {
  teacherId: Types.ObjectId;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Make params async for Next.js 15
) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "teacher") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id: courseId } = await context.params; // ✅ Fixed here
  const teacherId = session.user.id;

  if (!courseId) {
    return NextResponse.json({ message: "Course ID is required" }, { status: 400 });
  }

  try {
    // 1. Fetch the course and populate student details
    const course = await Course.findById(courseId)
      .populate({
        path: "studentId",
        model: User,
        select: "fullName email mobile",
      })
      .lean<LeanCourse>();

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // 2. Ensure the logged-in teacher is assigned to this course
    if (course.teacherId.toString() !== teacherId) {
      return NextResponse.json(
        { message: "Forbidden: You are not assigned to this course." },
        { status: 403 }
      );
    }

    // 3. Fetch completed classes for this specific course
    const completedClasses = await CompletedClass.find({
      courseId,
      teacherId,
    }).sort({ completedAt: -1 });

    return NextResponse.json({ course, completedClasses });
  } catch (error) {
    console.error("Error fetching teacher's course details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
