import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

function getRecipientQuery(recipientType: string) {
  switch (recipientType) {
    case 'all':
      return { role: { $in: ['student', 'teacher'] } };
    case 'student':
      return { role: 'student' };
    case 'approved_student':
      return { role: 'student', studentStatus: 'approved' };
    case 'teacher':
      return { role: 'teacher' };
    case 'approved_teacher':
      return { role: 'teacher', teacherStatus: 'approved' };
    case 'pending_teacher':
      return { role: 'teacher', teacherStatus: 'pending' };
    case 'signup':
      return { isVerified: false };
    default:
      return null;
  }
}

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const recipientType = searchParams.get('recipientType');

    if (!recipientType) {
      return NextResponse.json({ success: false, message: 'Missing recipientType parameter' }, { status: 400 });
    }

    await dbConnect();
    const query = getRecipientQuery(recipientType);
    if (!query) {
      return NextResponse.json({ success: false, message: 'Invalid recipient group' }, { status: 400 });
    }

    const users = await User.find(query).select('email fullName role studentStatus teacherStatus isVerified').sort({ fullName: 1 });
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientType, recipientEmail, recipientName, subject, htmlContent } = await req.json();

    if (!subject || !htmlContent) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Send to a single recipient if provided (used by client-side rate-limited queue)
    if (recipientEmail && recipientName) {
      try {
        const result = await sendEmail({
          to: recipientEmail,
          subject: subject,
          html: htmlContent.replace(/\[Name\]/g, recipientName),
        });
        
        if (result.success) {
          return NextResponse.json({ success: true, message: 'Email sent successfully.' });
        } else {
          return NextResponse.json({ success: false, message: result.message || 'Failed to send email.' }, { status: 500 });
        }
      } catch (error: any) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to send email.' }, { status: 500 });
      }
    }

    // Fallback block: original bulk group sending on server (if recipientType is passed without single email)
    if (!recipientType) {
      return NextResponse.json({ success: false, message: 'Missing recipientType or recipient details' }, { status: 400 });
    }

    const query = getRecipientQuery(recipientType);
    if (!query) {
      return NextResponse.json({ success: false, message: 'Invalid recipient group' }, { status: 400 });
    }

    const users = await User.find(query).select('email fullName');

    if (users.length === 0) {
      return NextResponse.json({ success: true, message: 'No users found in this group' });
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      try {
        const result = await sendEmail({
          to: user.email,
          subject: subject,
          html: htmlContent.replace(/\[Name\]/g, user.fullName),
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

