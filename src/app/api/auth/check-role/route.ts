import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('role').lean();

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // User exists, return their role
    return NextResponse.json({ role: user.role }, { status: 200 });

  } catch (error: any) {
    console.error('Check-role API Error:', error);
    return NextResponse.json( // This will now catch dbConnect errors too
      { message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}