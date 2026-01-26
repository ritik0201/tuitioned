import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * @description Fetches all users with the role of 'student'.
 * Note: It's generally recommended to place this logic in a dedicated
 * route like `/api/students` rather than a signup route.
 * This has been added here as per your request.
 * @param {NextRequest} request The incoming request object.
 * @returns {NextResponse} A response containing the list of students or an error.
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const studentsFromDb = await User.find({ role: 'student' })
      .select('fullName email mobile studentStatus')
      .lean();

    const formattedStudents = studentsFromDb.map(student => ({
      id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      mobile: student.mobile || 'N/A',
      studentStatus: student.studentStatus || 'pending',
    }));

    return NextResponse.json(formattedStudents, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    console.error('[GET_STUDENTS_IN_SIGNUP_ROUTE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    // The original student signup logic should be implemented here.
    return NextResponse.json({ message: "This is the student signup endpoint. Implement your POST logic here." });
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, status } = await request.json();

    if (!id || !status) {
      return new NextResponse('Missing id or status', { status: 400 });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { studentStatus: status },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    if (updatedUser.studentStatus !== status) {
      return NextResponse.json({ message: "Status not saved. Please check if 'studentStatus' is defined in your User schema." }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[PUT_STUDENT_STATUS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}