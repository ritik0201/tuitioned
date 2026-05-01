import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientType, subject, htmlContent } = await req.json();

    if (!recipientType || !subject || !htmlContent) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    let query: any = {};

    switch (recipientType) {
      case 'all':
        query = { role: { $in: ['student', 'teacher'] } };
        break;
      case 'student':
        query = { role: 'student' };
        break;
      case 'approved_student':
        query = { role: 'student', studentStatus: 'approved' };
        break;
      case 'teacher':
        query = { role: 'teacher' };
        break;
      case 'approved_teacher':
        query = { role: 'teacher', teacherStatus: 'approved' };
        break;
      case 'pending_teacher':
        query = { role: 'teacher', teacherStatus: 'pending' };
        break;
      case 'signup':
        query = { isVerified: false };
        break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid recipient group' }, { status: 400 });
    }

    const users = await User.find(query).select('email fullName');

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'No users found in this group' });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails sequentially (for now)
    for (const user of users) {
      try {
        const result = await sendEmail({
          to: user.email,
          subject: subject,
          html: htmlContent.replace(/\[Name\]/g, user.fullName), // Basic placeholder support
        });
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Emails sent: ${successCount} successful, ${failCount} failed.`,
      stats: { total: users.length, success: successCount, failed: failCount }
    });

  } catch (error: any) {
    console.error('Bulk email error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
