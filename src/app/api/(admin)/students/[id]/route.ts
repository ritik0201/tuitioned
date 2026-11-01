import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import DemoClass, { IDemoClass } from '@/models/DemoClass';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ Await here

  try {
    await dbConnect();

    const student = await User.findById(id).select('-otp -otpExpires -password').lean();
    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    const demoClass = await DemoClass.findOne({ studentId: id })
      .sort({ createdAt: -1 })
      .lean() as IDemoClass | null;

    const studentDetails = {
      _id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      mobile: student.mobile || 'N/A',
      dateOfBirth: student.dateOfBirth || null,
      address: student.address || { street: '', city: '', state: '', country: '' },
      grade: (student as any).grade || demoClass?.grade || 'N/A',
      fatherName: (student as any).fatherName || demoClass?.fatherName || 'N/A',
      country: student.address?.country || demoClass?.country || 'N/A',
      studentStatus: student.studentStatus || 'pending',
    };

    return NextResponse.json(studentDetails);
  } catch (error) {
    console.error('[GET_STUDENT_DETAILS]', error);
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
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      fullName,
      email,
      mobile,
      dateOfBirth,
      fatherName,
      grade,
      address,
      country,
      studentStatus,
    } = body;

    const targetName = fullName || name;

    const existingStudent = await User.findById(id);
    if (!existingStudent || existingStudent.role !== 'student') {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if new email conflicts with another user
    if (email && email.trim().toLowerCase() !== existingStudent.email.toLowerCase()) {
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
    if (targetName !== undefined) updateFields.fullName = targetName.trim();
    if (email !== undefined) updateFields.email = email.trim().toLowerCase();
    if (mobile !== undefined) updateFields.mobile = mobile.trim();
    if (dateOfBirth !== undefined) {
      updateFields.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }
    if (fatherName !== undefined) updateFields.fatherName = fatherName.trim();
    if (grade !== undefined) updateFields.grade = grade.trim();
    if (studentStatus !== undefined) updateFields.studentStatus = studentStatus;

    const targetCountry = country || address?.country;
    if (address !== undefined) {
      updateFields.address = {
        street: address.street?.trim() || "",
        city: address.city?.trim() || "",
        state: address.state?.trim() || "",
        country: targetCountry?.trim() || "",
      };
    } else if (country !== undefined) {
      updateFields['address.country'] = country.trim();
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-otp -otpExpires -password').lean();

    // Synchronize relevant fields with DemoClass entries for this student
    const demoUpdate: any = {};
    if (targetName !== undefined) demoUpdate.studentName = targetName.trim();
    if (mobile !== undefined) demoUpdate.mobile = mobile.trim();
    if (fatherName !== undefined) demoUpdate.fatherName = fatherName.trim();
    if (grade !== undefined) demoUpdate.grade = grade.trim();
    if (address?.city !== undefined) demoUpdate.city = address.city.trim();
    if (targetCountry !== undefined) demoUpdate.country = targetCountry.trim();

    if (Object.keys(demoUpdate).length > 0) {
      await DemoClass.updateMany({ studentId: id }, { $set: demoUpdate });
    }

    const latestDemo = await DemoClass.findOne({ studentId: id })
      .sort({ createdAt: -1 })
      .lean() as IDemoClass | null;

    const formattedStudent = {
      _id: updatedStudent!._id.toString(),
      name: updatedStudent!.fullName,
      email: updatedStudent!.email,
      mobile: updatedStudent!.mobile || 'N/A',
      dateOfBirth: updatedStudent!.dateOfBirth || null,
      address: updatedStudent!.address || { street: '', city: '', state: '', country: '' },
      grade: (updatedStudent as any)!.grade || latestDemo?.grade || 'N/A',
      fatherName: (updatedStudent as any)!.fatherName || latestDemo?.fatherName || 'N/A',
      country: updatedStudent!.address?.country || latestDemo?.country || 'N/A',
      studentStatus: updatedStudent!.studentStatus || 'pending',
    };

    return NextResponse.json({
      success: true,
      message: "Student profile updated successfully.",
      student: formattedStudent,
    });
  } catch (error: any) {
    console.error("[PUT_STUDENT_PROFILE]", error);
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

    const deletedStudent = await User.findByIdAndDelete(id);

    if (!deletedStudent) {
      return new NextResponse("Student not found", { status: 404 });
    }

    await DemoClass.deleteMany({ studentId: id });

    return NextResponse.json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("[DELETE_STUDENT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
