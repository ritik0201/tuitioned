import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await dbConnect();

    // Fetch teacher details
    const teacher = await User.findById(id).select('-otp -otpExpires -password').lean();
    if (!teacher || teacher.role !== 'teacher') {
      return new NextResponse('Teacher not found', { status: 404 });
    }

    // Fetch courses assigned to this teacher
    const courses = await Course.find({ teacherId: id })
      .populate({
        path: 'studentId',
        model: User,
        select: 'fullName',
      })
      .sort({ createdAt: -1 })
      .lean();

    const responseData = {
      teacher: {
        ...teacher,
        experience: (teacher as any).experience || (teacher as any).experiance || '',
      },
      courses,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[GET_TEACHER_DETAILS]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      qualification,
      experience,
      listOfSubjects,
      joinLink,
      aboutTeacher,
      cvUrl,
      profileImage,
      address,
      dateOfBirth,
      teacherStatus,
    } = body;

    const existingTeacher = await User.findById(id);
    if (!existingTeacher || existingTeacher.role !== 'teacher') {
      return NextResponse.json({ success: false, message: "Teacher not found" }, { status: 404 });
    }

    // Check email conflict if email changed
    if (email && email.trim().toLowerCase() !== existingTeacher.email.toLowerCase()) {
      const emailConflict = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: "Email is already in use by another account." },
          { status: 400 }
        );
      }
    }

    const updateFields: any = {};
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (email !== undefined) updateFields.email = email.trim().toLowerCase();
    if (mobile !== undefined) updateFields.mobile = mobile.trim();
    if (qualification !== undefined) updateFields.qualification = qualification.trim();
    if (experience !== undefined) {
      updateFields.experience = experience.trim();
      updateFields.experiance = experience.trim();
    }
    if (listOfSubjects !== undefined) {
      updateFields.listOfSubjects = Array.isArray(listOfSubjects)
        ? listOfSubjects
        : listOfSubjects.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (joinLink !== undefined) updateFields.joinLink = joinLink.trim();
    if (aboutTeacher !== undefined) updateFields.aboutTeacher = aboutTeacher.trim();
    if (cvUrl !== undefined) updateFields.cvUrl = cvUrl.trim();
    if (profileImage !== undefined) updateFields.profileImage = profileImage.trim();
    if (address !== undefined) updateFields.address = address;
    if (dateOfBirth !== undefined) {
      updateFields.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (teacherStatus !== undefined) {
      updateFields.teacherStatus = teacherStatus;
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-otp -otpExpires -password').lean();

    return NextResponse.json({
      success: true,
      message: "Teacher profile updated successfully.",
      teacher: {
        ...updatedTeacher,
        experience: (updatedTeacher as any)?.experience || (updatedTeacher as any)?.experiance || '',
      },
    });
  } catch (error: any) {
    console.error("[PUT_TEACHER_PROFILE]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedTeacher = await User.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return new NextResponse("Teacher not found", { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("[DELETE_TEACHER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
