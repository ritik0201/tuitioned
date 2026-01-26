import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const result = await User.updateMany(
      { role: 'student', studentStatus: { $exists: false } },
      { $set: { studentStatus: 'pending' } }
    );

    return NextResponse.json({
      message: 'Student status migration completed successfully.',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('[MIGRATE_STUDENT_STATUS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}