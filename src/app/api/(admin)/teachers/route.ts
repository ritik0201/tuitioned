import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = { role: 'teacher' };
    if (status) {
      query.teacherStatus = status;
    }

    // Fetch all documents from the User collection where the role is 'teacher'
    const teachersFromDb = await User.find(query);

    // Map the data to match the frontend's expected 'Teacher' type
    const teachers = teachersFromDb.map(teacher => ({
      id: teacher.id,
      name: teacher.fullName,
      email: teacher.email,
      mobile: teacher.mobile || 'N/A', // Provide a fallback for optional fields
      listOfSubjects: teacher.listOfSubjects || [],
      teacherStatus: teacher.teacherStatus || 'pending',
    }));

    return NextResponse.json(teachers, {
      headers: { 'Cache-Control': 'no-store' }, // Ensure fresh data on every request
    });
  } catch (error) {
    console.error('[GET_TEACHERS_MONGO]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, teacherStatus } = body;

    if (!id || !teacherStatus) {
      return new NextResponse("Missing ID or Status", { status: 400 });
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      id,
      { teacherStatus },
      { new: true }
    );

    return NextResponse.json(updatedTeacher);
  } catch (error) {
    console.error("[PUT_TEACHERS_MONGO]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}