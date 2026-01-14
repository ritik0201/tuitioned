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
      .select('fullName email mobile')
      .lean();

    const formattedStudents = studentsFromDb.map(student => ({
      id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      mobile: student.mobile || 'N/A',
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