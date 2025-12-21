import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DemoClass from '@/models/DemoClass';
import User from '@/models/User';
import mongoose, { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface PopulatedDemoClass {
  _id: Types.ObjectId;
  studentId: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    mobile?: string;
  };
  teacherId?: {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
  };
  fatherName: string;
  subject: string;
  topic?: string;
  grade: string;
  city: string;
  country: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Demo Class ID' }, { status: 400 });
    }

    const demoClass = await DemoClass.findById(id)
      .populate({
        path: 'studentId',
        model: User,
        select: '_id fullName email mobile', // Select all necessary student fields
      })
      .populate({ path: 'teacherId', model: User, select: 'fullName email' })
      .lean<PopulatedDemoClass>();

    if (!demoClass) {
      return NextResponse.json({ message: 'Demo Class not found' }, { status: 404 });
    }

    // Authorization check:
    // Allow if the user is an admin OR if the user is the student who booked the demo.
    const isOwner = demoClass.studentId._id.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(demoClass);
  } catch (error) {
    console.error('[GET_DEMOCLASS_BY_ID]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
