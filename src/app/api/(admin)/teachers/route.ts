import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    // Fetch all documents from the User collection where the role is 'teacher'
    const teachersFromDb = await User.find({ role: 'teacher' });

    // Map the data to match the frontend's expected 'Teacher' type
    const teachers = teachersFromDb.map(teacher => ({
      id: teacher.id,
      name: teacher.fullName,
      email: teacher.email,
      mobile: teacher.mobile || 'N/A', // Provide a fallback for optional fields
      listOfSubjects: teacher.listOfSubjects || [],
    }));

    return NextResponse.json(teachers, {
      headers: { 'Cache-Control': 'no-store' }, // Ensure fresh data on every request
    });
  } catch (error) {
    console.error('[GET_TEACHERS_MONGO]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}