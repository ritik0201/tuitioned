import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import CompletedClass from '@/models/CompletedClass';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all courses for the teacher
    const courses = await Course.find({ teacherId }).populate('studentId', 'fullName');

    // Calculate total earnings
    const totalEarnings = courses.reduce((acc, course) => {
      const earningsForCourse = (course.noOfclassTeacher || 0) * (course.teacherPerClassPrice || 0);
      return acc + earningsForCourse;
    }, 0);

    // Get total unique students
    const studentIds = new Set(courses.map(course => course.studentId._id.toString()));
    const totalStudents = studentIds.size;

    // Get active courses (assuming active means classes are left)
    const activeCourses = courses.filter(course => course.noOfClasses > 0).length;

    // Get total classes left across all courses
    const totalClasses = courses.reduce((acc, course) => acc + course.noOfClasses, 0);

    // Get recent courses (last 5 updated)
    const recentCourses = await Course.find({ teacherId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('studentId', 'fullName');

    // Get recent activity (last 5 completed classes)
    const recentActivity = await CompletedClass.find({ teacherId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('studentId', 'fullName');

    const dashboardData = {
      totalStudents,
      activeCourses,
      totalClasses,
      totalEarnings,
      recentCourses,
      recentActivity,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error: any) {
    console.error('Error fetching teacher dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while fetching dashboard data.',
      },
      { status: 500 }
    );
  }
}
