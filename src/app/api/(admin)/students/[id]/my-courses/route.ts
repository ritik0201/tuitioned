import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import { sendEmail } from '@/lib/sendEmail';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    await dbConnect();
    const courses = await Course.find({ studentId })
      .populate('teacherId', 'fullName email') // Populate the teacher's name and email
      .sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: studentId } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      grade,
      noOfClasses,
      perClassPrice,
      teacherPerClassPrice,
      classTime,
      teacherId,
      classDays,
      joinLink,
      classroomLink,
    } = body;

    if (
      !title ||
      !description ||
      !grade ||
      noOfClasses === undefined ||
      !perClassPrice ||
      !teacherId ||
      !joinLink) {
      return NextResponse.json(
        { message: 'Missing required course fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    const newCourse = new Course({
      title,
      description,
      grade,
      noOfClasses,
      noOfclassTeacher: 0, // Explicitly set to 0 on creation
      perClassPrice,
      teacherPerClassPrice: teacherPerClassPrice || 0,
      classTime,
      classDays,
      joinLink,
      classroomLink,
      studentId: student._id,
      teacherId: teacher._id,
    });

    await newCourse.save();

    // Send notification emails
    const courseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/student/courses/${newCourse._id}`;

    // 1. Email to the student
    await sendEmail({
      to: student.email,
      subject: `New Course Assigned: ${newCourse.title} 🎉`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Course Assigned!</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #4f46e5; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
        ul { list-style: none; padding: 0; margin: 20px 0; }
        li { background-color: #f9f9f9; padding: 10px; border-radius: 4px; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Course Assigned!</h2>
        </div>
        <div class="content">
            <p>Hi ${student.fullName},</p>
            <p>A new course, "<strong>${newCourse.title}</strong>", has been successfully created and assigned to you by the TuitionEd Team.</p>
            <p><strong>Course Details:</strong></p>
            <ul>
              <li><strong>Title:</strong> ${newCourse.title}</li>
              <li><strong>Grade:</strong> ${newCourse.grade}</li>
              <li><strong>Teacher:</strong> ${teacher.fullName}</li>
            </ul>
            <p>You can view your new course in your student dashboard by clicking the button below:</p>
            <p style="text-align: center; margin-top: 25px;"><a href="${courseUrl}" class="button">View My Course</a></p>
            <p>We wish you the best in your learning journey!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TuitionEd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    });

    // 2. Email to the teacher
    await sendEmail({
      to: teacher.email,
      subject: `You have a new course assignment: ${newCourse.title} 🚀`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Course Assignment</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #10b981; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Course Assignment</h2>
        </div>
        <div class="content">
            <p>Hi ${teacher.fullName},</p>
            <p>You have been assigned a new course for the student <strong>${student.fullName}</strong>.</p>
            <p><strong>Course:</strong> ${newCourse.title}</p>
            <p>Please check your dashboard for more details.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TuitionEd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Course created and assigned successfully',
        course: newCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to assign course:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: 'Validation Error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
