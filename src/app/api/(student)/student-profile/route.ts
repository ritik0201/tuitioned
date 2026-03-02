import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import DemoClass, { IDemoClass } from '@/models/DemoClass';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const studentId = session.user.id;

    const user = await User.findById(studentId).select('-otp -otpExpires -isVerified -messages').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const demoClass = await DemoClass.findOne({ studentId }).sort({ createdAt: -1 }).lean() as IDemoClass | null;
    const profile = {
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile || '',
      dateOfBirth: user.dateOfBirth || null,
      address: user.address || { street: '', city: '', state: '' },
      grade: demoClass?.grade || '',
      fatherName: demoClass?.fatherName || '',
    };

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const studentId = session.user.id;
    const body = await request.json();

    const { fullName, mobile, dateOfBirth, address, grade, fatherName } = body;

    if (!fullName) {
      return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
    }

    // Update the User model
    await User.findByIdAndUpdate(
      studentId,
      {
        $set: {
          fullName,
          mobile,
          dateOfBirth,
          address,
        },
      },
      { new: true, runValidators: true }
    ).select('-otp -otpExpires -isVerified -messages');

    // Find the latest DemoClass and update it, or create one if it doesn't exist.
    // This prevents an error if the user has a profile but no demo class booking yet.
    await DemoClass.findOneAndUpdate(
      { studentId },
      { $set: { grade, fatherName } },
      { sort: { createdAt: -1 }, new: true, upsert: true } // upsert:true creates the doc if it doesn't exist
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}