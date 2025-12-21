import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import DemoClass from '@/models/DemoClass';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a teacher
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const teacherId = session.user.id;

    // Fetch demo classes where teacherId matches the logged-in teacher
    // Populating student details for display
    const demoClasses = await DemoClass.find({ teacherId })
      .populate({
        path: 'studentId',
        model: User,
        select: 'fullName email mobile'
      })
      .sort({ date: 1 }); // Sort by date ascending (upcoming first)

    return NextResponse.json(demoClasses);
  } catch (error: any) {
    console.error('Error fetching teacher demo classes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}