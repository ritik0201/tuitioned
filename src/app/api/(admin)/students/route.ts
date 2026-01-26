import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import DemoClass from '@/models/DemoClass';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Find all demo classes with status 'completed'
    const completedDemos = await DemoClass.find({ status: 'completed' }).select('studentId').lean();
    
    // Extract unique student IDs
    const studentIds = [...new Set(completedDemos.map(demo => demo.studentId.toString()))];

    // Fetch users who are in the completed list OR have approved status
    const students = await User.find({
      role: 'student',
      $or: [
        { _id: { $in: studentIds } },
        { studentStatus: 'approved' }
      ]
    }).select('fullName email mobile').lean();

    const formattedStudents = students.map(student => ({
      id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      mobile: student.mobile || 'N/A',
    }));

    return NextResponse.json(formattedStudents);

  } catch (error) {
    console.error('[GET_STUDENTS_MONGO]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
