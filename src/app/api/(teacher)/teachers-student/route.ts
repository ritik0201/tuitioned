import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';

interface PopulatedStudent {
  _id: string;
  fullName: string;
  email: string;
}

interface PopulatedCourse {
  _id: any; // Mongoose ObjectId can be complex, 'any' is safe here
  title: string;
  grade: string;
  studentId?: PopulatedStudent;
  noOfClasses: number;
}
/**
 * GET handler to fetch students for a logged-in teacher.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    // Secure the endpoint: only allow logged-in teachers
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Step 1: Find all courses taught by the logged-in teacher.
    // Populate the studentId field to get student details.
    const teacherCourses = await Course.find({ teacherId })
      .populate<{ studentId: PopulatedStudent }>({
        path: 'studentId',
        model: User,
        select: 'fullName email' // Select only the fields you need from the User model
      })
      .lean<PopulatedCourse[]>();

    if (teacherCourses.length === 0) {
      // It's valid for a teacher to have no courses or students, so return an empty array.
      return NextResponse.json([]);
    }

    // Map to a more client-friendly format
    const courseData = teacherCourses.map(course => ({
      id: course._id.toString(),
      courseName: course.title,
      studentId: course.studentId?._id.toString(),
      studentName: course.studentId?.fullName || 'N/A',
      email: course.studentId?.email || 'N/A',
      grade: course.grade,
      noOfClasses: course.noOfClasses,
    }));

    // Step 4: Return the list of students.
    return NextResponse.json(courseData);

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}