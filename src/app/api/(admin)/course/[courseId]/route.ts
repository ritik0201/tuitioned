import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Course from "@/models/Course";
import User from "@/models/User";
import mongoose from "mongoose";
import CompletedClass from "@/models/CompletedClass";

/**
 * GET /api/admin/course/{courseId}
 * Fetches detailed information for a single course.
 * Accessible only by users with the 'admin' role.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> } //  params is a Promise
) {
  const { courseId } = await context.params; //  await params
  await dbConnect();

  try {
    // 1. Authenticate and Authorize the user as an admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // 2. Find the course by its ID and populate related user data
    const course = await Course.findById(courseId)
      .populate({
        path: "teacherId",
        model: User,
        select: "fullName email mobile", // Fields to show for the teacher
      })
      .populate({
        path: "studentId",
        model: User,
        select: "fullName email mobile", // Fields to show for the student
      });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const completedClasses = await CompletedClass.find({ courseId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, course, completedClasses });
  } catch (error) {
    console.error("Error fetching course details for admin:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching course details.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/course/{courseId}
 * Deletes a single course.
 * Accessible only by users with the 'admin' role.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  await dbConnect();

  try {
    // 1. Authenticate and Authorize the user as an admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // 2. Validate Course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Course ID" },
        { status: 400 }
      );
    }

    // 3. Delete the course
    const deletedCourse = await Course.findByIdAndDelete(courseId);

    if (!deletedCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course for admin:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the course.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/course/{courseId}
 * Updates detailed information for a single course.
 * Accessible only by users with the 'admin' role.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> } // ✅ same fix here
) {
  const { courseId } = await context.params; // ✅ await params
  await dbConnect();

  try {
    // 1. Authenticate and Authorize the user as an admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // 2. Validate Course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Course ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      grade,
      classTime,
      classDays,
      noOfClasses,
      perClassPrice,
      joinLink,
      classroomLink,
      teacherId,
      teacherPerClassPrice,
      noOfclassTeacher,
      paymentStatus,
    } = body;

    const updateData: Record<string, any> = {};

    // Dynamically build the update object only with fields that are present
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (grade) updateData.grade = grade;
    if (classTime) updateData.classTime = classTime;
    if (classDays) updateData.classDays = classDays;
    if (noOfClasses !== undefined) updateData.noOfClasses = noOfClasses;
    if (perClassPrice !== undefined) updateData.perClassPrice = perClassPrice;
    if (joinLink) updateData.joinLink = joinLink;
    if (classroomLink) updateData.classroomLink = classroomLink;
    if (teacherPerClassPrice !== undefined) updateData.teacherPerClassPrice = teacherPerClassPrice;
    if (noOfclassTeacher !== undefined) updateData.noOfclassTeacher = noOfclassTeacher;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // If no fields to update are provided, return an error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "No fields to update provided." }, { status: 400 });
    }

    // 4. Validate teacherId
    if (teacherId) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return NextResponse.json({ success: false, message: "Invalid Teacher ID provided" }, { status: 400 });
      }
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return NextResponse.json({ success: false, message: "Assigned teacher not found or is not a teacher" }, { status: 400 });
      }
      updateData.teacherId = new mongoose.Types.ObjectId(teacherId);
    }

    // 5. Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: "teacherId",
        model: User,
        select: "fullName email mobile",
      })
      .populate({
        path: "studentId",
        model: User,
        select: "fullName email mobile",
      });

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error: any) {
    console.error("Error updating course details for admin:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating course details.",
      },
      { status: 500 }
    );
  }
}
