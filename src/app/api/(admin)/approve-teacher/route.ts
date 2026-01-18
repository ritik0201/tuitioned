import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const approvedTeachers = await User.find({ 
      role: 'teacher', 
      teacherStatus: 'approved' 
    }).sort({ createdAt: -1 });

    const teachers = approvedTeachers.map(teacher => ({
      id: teacher._id.toString(),
      name: teacher.fullName,
      email: teacher.email,
      mobile: teacher.mobile || 'N/A',
      listOfSubjects: teacher.listOfSubjects || [],
      teacherStatus: teacher.teacherStatus,
    }));

    return NextResponse.json(teachers, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[GET_APPROVED_TEACHERS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}