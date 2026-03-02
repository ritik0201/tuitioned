import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import CompletedClass from '@/models/CompletedClass';
import cloudinary from '@/lib/cloudinary';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  await dbConnect();
  const dbSession = await mongoose.startSession();

  try {
    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;
    const topic = formData.get('topic') as string;
    const duration = formData.get('duration') as string | null;
    const homeworkFile = formData.get('homeworkFile') as File | null;

    if (!courseId || !topic) {
      return NextResponse.json({ message: 'Course ID and topic are required' }, { status: 400 });
    }

    let homeworkFileUrl: string | undefined;

    if (homeworkFile) {
      try {
        const fileBuffer = await homeworkFile.arrayBuffer();
        const mimeType = homeworkFile.type;
        const encoding = 'base64';
        const base64Data = Buffer.from(fileBuffer).toString('base64');
        const fileUri = `data:${mimeType};${encoding},${base64Data}`;

        const result = await cloudinary.uploader.upload(fileUri, {
          folder: 'tuition-ed/homework',
        });
        homeworkFileUrl = result.secure_url;
      } catch (uploadError: any) {
        return NextResponse.json({ message: `File upload failed: ${uploadError.message}` }, { status: 500 });
      }
    }

    let newCompletedClass;

    await dbSession.withTransaction(async () => {
      const course = await Course.findById(courseId).session(dbSession);

      if (!course) {
        throw new Error('Course not found.');
      }

      if (course.teacherId.toString() !== teacherId) {
        throw new Error('You are not authorized to modify this course.');
      }

      if (course.noOfClasses <= 0) {
        throw new Error('No remaining classes to complete.');
      }

      // Decrement the number of classes
      course.noOfClasses -= 1;

      // Increment the number of classes taught by the teacher
      course.noOfclassTeacher = (course.noOfclassTeacher || 0) + 1;

      // Create the new completed class record
      newCompletedClass = new CompletedClass({
        courseId: course._id,
        teacherId: course.teacherId,
        studentId: course.studentId,
        topic,
        duration: duration ? Number(duration) : undefined,
        homeworkFile: homeworkFileUrl,
      });

      await newCompletedClass.save({ session: dbSession });
      await course.save({ session: dbSession });
    });

    return NextResponse.json({
      success: true,
      message: 'Class marked as complete and course updated.',
      data: newCompletedClass,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error marking class as complete:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    await dbSession.endSession();
  }
}