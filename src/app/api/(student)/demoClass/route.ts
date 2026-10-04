import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; 
import DemoClass from '@/models/DemoClass';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await dbConnect();

    let demoClasses;

    // If the user is an admin, fetch all demo classes. Otherwise, fetch only their own.
    if (session.user.role === 'admin') {
      demoClasses = await DemoClass.find({})
        .populate({ path: 'studentId', model: User, select: 'email fullName' })
        .populate({ path: 'teacherId', model: User, select: 'fullName email' })
        .sort({ createdAt: -1, _id: -1 });
    } else {
      demoClasses = await DemoClass.find({ studentId: session.user.id })
        .populate({ path: 'teacherId', model: User, select: 'fullName email' })
        .sort({ createdAt: -1, _id: -1 });
    }

    // The data is returned as a plain array, not nested in a `data` property.
    return NextResponse.json(demoClasses);
  } catch (error: any) {
    console.error('API GET Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();

    const { fatherName, email, grade, subject, topic, city, country, bookingDateAndTime } = body;

    const requiredFields = {
      fatherName: "Father's name is required.",
      email: "Email is required.",
      grade: "Grade is required.",
      subject: "Subject is required.",
      city: "City is required.",
      country: "Country is required.",
      bookingDateAndTime: "Booking date and time are required."
    };

    for (const field in requiredFields) {
      if (!body[field]) {
        const message = requiredFields[field as keyof typeof requiredFields];
        return NextResponse.json({ success: false, message }, { status: 400 });
      }
    }

    // Validate subject and handle comma-separated subjects elegantly
    const subjectList = subject ? String(subject).split(',').map((s: string) => s.trim()) : [];
    if (subjectList.includes('other') && (!body.otherSubject || body.otherSubject.trim() === '')) {
        return NextResponse.json(
            { success: false, message: 'Please specify the subject.' },
            { status: 400 }
        );
    }

    const resolvedSubject = subjectList.includes('other')
      ? subjectList.map((s: string) => s === 'other' ? body.otherSubject : s).join(', ')
      : subjectList.join(', ');

    const dateObj = new Date(bookingDateAndTime);
    dateObj.setUTCHours(0, 0, 0, 0);

    const newDemoClass = await DemoClass.create({
      studentId: session.user.id,
      studentName: session.user.fullName,
      fatherName,
      grade,
      city,
      country,
      topic,
      subject: resolvedSubject,
      bookingDateAndTime,
      // teacherId can be assigned later by an admin
    });

    const calendarStartDate = new Date(bookingDateAndTime);
    if (isNaN(calendarStartDate.getTime())) {
      calendarStartDate.setTime(dateObj.getTime());
    }
    if (typeof bookingDateAndTime === 'string' && bookingDateAndTime.includes('-') && !bookingDateAndTime.includes('T')) {
      const parts = bookingDateAndTime.split('-').map(Number);
      if (parts.length === 3) {
        calendarStartDate.setFullYear(parts[0], parts[1] - 1, parts[2]);
        calendarStartDate.setHours(10, 0, 0, 0);
      }
    }

    const calendarEndDate = new Date(calendarStartDate.getTime() + 60 * 60 * 1000);
    const formatISO = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const calTitle = encodeURIComponent(`Tuitioned 1-on-1 Demo Class - ${resolvedSubject}`);
    const calDetails = encodeURIComponent(
      `Tuitioned Live 1-on-1 Demo Class Session.\n\n` +
      `Student Name: ${session.user.fullName}\n` +
      `Grade/Class: ${grade || "N/A"}\n` +
      `Subject: ${resolvedSubject}\n` +
      (topic ? `Topic: ${topic}\n` : "") +
      `\nWe look forward to having you in class!`
    );
    const calLocation = encodeURIComponent("Tuitioned Online Classroom (https://tuitioned.com)");
    const calDates = `${formatISO(calendarStartDate)}/${formatISO(calendarEndDate)}`;
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLocation}&dates=${calDates}`;

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Tuitioned" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Demo Class Confirmed!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #0EA5E9; text-align: center; margin-bottom: 20px;">Demo Class Confirmed!</h1>
            <p style="font-size: 16px; color: #333;">Hi <strong>${session.user.fullName}</strong>,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Your demo class has been successfully booked! We are excited to help you on your learning journey.
            </p>
            <div style="background-color: #f0f9ff; border-left: 5px solid #0EA5E9; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Subject:</strong> ${resolvedSubject}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Date:</strong> ${dateObj.toDateString()}</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${googleCalendarUrl}" target="_blank" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);">
                📅 Add to Google Calendar
              </a>
            </div>
            <p style="font-size: 16px; color: #555;">We look forward to seeing you there! And Our team contact you within 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px; color: #888; text-align: center;">
              Best regards,<br/>
              <strong>The Tuition-ed Team</strong>
            </p>
          </div>
        </div>
      `,
    });

    // Send notification email to admin
    await transporter.sendMail({
      from: `"Tuitioned" <${process.env.EMAIL_USER}>`,
      to: "ritikkatsa2005@gmail.com, adityayadav114@gmail.com, tuitioned01@gmail.com, harshitverma503@gmail.com",
      subject: "New Demo Class Request!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f5; padding: 20px; border-radius: 10px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2563EB; text-align: center; border-bottom: 2px solid #f4f4f5; padding-bottom: 15px; margin-top: 0;">New Demo Class Request </h2>
            <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 25px;">
              A new demo class has been booked. Here are the details:
            </p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f8fafc;">
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; width: 40%;">Student Name</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${session.user.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Father's Name</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${fatherName}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Email</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${body.email}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Mobile</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${body.mobile || 'Not provided'}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Grade</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${grade}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Subject</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${resolvedSubject}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Topic</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${topic || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Preferred Date</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${dateObj.toDateString()}</td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">City</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${body.city}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600;">Country</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155;">${body.country}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, data: newDemoClass },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admins only.' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id, status, teacherId, joinLink, bookingDateAndTime, timeZone } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Demo Class ID is required.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (teacherId !== undefined) {
      if (!teacherId) {
        updateData.teacherId = null;
      } else {
        const teacher = await User.findById(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
          return NextResponse.json(
            { success: false, message: 'Invalid teacher ID or User is not a teacher.' },
            { status: 400 }
          );
        }
        updateData.teacherId = teacherId;
      }
    }
    if (joinLink) updateData.joinLink = joinLink;
    if (bookingDateAndTime) updateData.bookingDateAndTime = bookingDateAndTime;
    if (timeZone) updateData.timeZone = timeZone;

    const updatedDemoClass = await DemoClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedDemoClass) {
      return NextResponse.json({ success: false, message: 'Demo Class not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedDemoClass }, { status: 200 });
  } catch (error: any) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}