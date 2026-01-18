import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('teacherStatus');

    return NextResponse.json({ teacherStatus: user?.teacherStatus || 'pending' });
  } catch (error) {
    console.error("Error fetching teacher status:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}