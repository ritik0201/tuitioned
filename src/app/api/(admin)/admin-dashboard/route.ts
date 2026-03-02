import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';
import DemoClass from '@/models/DemoClass';

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch key metrics in parallel
    const [
      totalStudents,
      totalTeachers,
      activeCourses,
      allCoursesForEarnings,
      recentDemos,
      recentStudents,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Course.countDocuments({ noOfClasses: { $gt: 0 } }),
      Course.find({}).select('noOfclassTeacher teacherPerClassPrice').lean(),
      DemoClass.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'studentId',
          select: 'fullName email',
          model: User
        })
        .lean(),
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fullName email createdAt')
        .lean(),
    ]);

    // 2. Calculate total pending earnings
    const totalPendingEarnings = allCoursesForEarnings.reduce((acc, course) => {
      const earningsForCourse = (course.noOfclassTeacher || 0) * (course.teacherPerClassPrice || 0);
      return acc + earningsForCourse;
    }, 0);

    // 3. Assemble dashboard data
    const dashboardData = {
      totalStudents,
      totalTeachers,
      activeCourses,
      totalPendingEarnings,
      recentDemos,
      recentStudents,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error: any) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while fetching dashboard data.',
      },
      { status: 500 }
    );
  }
}