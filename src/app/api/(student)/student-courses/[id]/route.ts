import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';
import CompletedClass from '@/models/CompletedClass';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const studentId = session.user.id;
  const userRole = session.user.role;
  const { id: courseId } = await params; 

  if (!courseId) {
    return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
  }

  try {
    const course = await Course.findById(courseId).populate({
      path: 'teacherId',
      model: User,
      select: 'fullName',
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    if (userRole !== 'admin' && course.studentId.toString() !== studentId) {
      return NextResponse.json({ message: 'Forbidden: You are not enrolled in this course.' }, { status: 403 });
    }

    const completedClasses = await CompletedClass.find({
      courseId: courseId,
      studentId: studentId,
    }).sort({ completedAt: -1 });

    const courseData = {
      ...course.toObject(),
      teacherName: course.teacherId ? course.teacherId.fullName : 'Not Assigned',
    };

    return NextResponse.json({ course: courseData, completedClasses }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
