import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const stats = {
      all: await User.countDocuments({ role: { $in: ['student', 'teacher'] } }),
      student: await User.countDocuments({ role: 'student' }),
      approved_student: await User.countDocuments({ role: 'student', studentStatus: 'approved' }),
      teacher: await User.countDocuments({ role: 'teacher' }),
      approved_teacher: await User.countDocuments({ role: 'teacher', teacherStatus: 'approved' }),
      pending_teacher: await User.countDocuments({ role: 'teacher', teacherStatus: 'pending' }),
      signup: await User.countDocuments({ isVerified: false }),
    };

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
