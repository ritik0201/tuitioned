import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();

    // Fetch teacher details
    const teacher = await User.findById(id).select('-otp -otpExpires -password').lean();
    if (!teacher || teacher.role !== 'teacher') {
      return new NextResponse('Teacher not found', { status: 404 });
    }

    // Fetch courses assigned to this teacher
    const courses = await Course.find({ teacherId: id })
      .populate({
        path: 'studentId',
        model: User,
        select: 'fullName',
      })
      .sort({ createdAt: -1 })
      .lean();

    const responseData = {
      teacher,
      courses,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[GET_TEACHER_DETAILS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedTeacher = await User.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("[DELETE_TEACHER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
