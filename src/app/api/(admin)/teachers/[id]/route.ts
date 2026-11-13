import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Course from '@/models/Course';
import DemoClass from '@/models/DemoClass';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

function normalizeDayName(input: string): DayName | null {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim().toLowerCase();
  if (str.startsWith('mon')) return 'Monday';
  if (str.startsWith('tue')) return 'Tuesday';
  if (str.startsWith('wed')) return 'Wednesday';
  if (str.startsWith('thu')) return 'Thursday';
  if (str.startsWith('fri')) return 'Friday';
  if (str.startsWith('sat')) return 'Saturday';
  if (str.startsWith('sun')) return 'Sunday';
  return null;
}

function extractDays(input: any): DayName[] {
  if (!input) return [];
  const results: DayName[] = [];
  const items = Array.isArray(input) ? input : String(input).split(/[,&/|]/);
  for (const item of items) {
    const raw = typeof item === 'string' ? item.trim() : '';
    if (!raw) continue;
    const direct = normalizeDayName(raw);
    if (direct && !results.includes(direct)) {
      results.push(direct);
    } else {
      const words = raw.split(/[\s-]+/);
      for (const w of words) {
        const wordNorm = normalizeDayName(w);
        if (wordNorm && !results.includes(wordNorm)) {
          results.push(wordNorm);
        }
      }
    }
  }
  return results;
}

function extractTime(input?: string): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  const match = trimmed.match(/\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b/i) || trimmed.match(/\b\d{1,2}:\d{2}\b/);
  if (match) return match[0];
  if (trimmed.length > 0 && !normalizeDayName(trimmed) && trimmed.length <= 15) {
    return trimmed;
  }
  return '';
}

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

    // Fetch courses assigned to this teacher with student details
    const courses = await Course.find({ teacherId: id })
      .populate({
        path: 'studentId',
        model: User,
        select: 'fullName profileImage email',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch confirmed/pending demo classes assigned to this teacher
    let demoClasses: any[] = [];
    try {
      demoClasses = await DemoClass.find({
        teacherId: id,
        status: { $in: ['confirmed', 'pending'] }
      }).populate('studentId', 'fullName profileImage email').lean();
    } catch (err) {
      // DemoClass query optional
    }

    // Build Weekly Schedule (Monday to Sunday)
    const scheduleMap: Record<DayName, any[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    const addStudentToDay = (day: DayName, studentClass: any) => {
      const exists = scheduleMap[day].some(
        item => item.courseId === studentClass.courseId && item.studentId === studentClass.studentId && (item.time === studentClass.time || (!item.time && !studentClass.time))
      );
      if (!exists) {
        scheduleMap[day].push(studentClass);
      }
    };

    // Populate regular courses
    for (const course of courses) {
      if (!course.studentId) continue;
      const c = course as any;
      const student = c.studentId;
      const studentId = student?._id?.toString() || '';
      const studentName = student?.fullName || 'Student';
      const studentImage = student?.profileImage || '';
      const studentEmail = student?.email || '';
      const courseId = c._id?.toString() || '';
      const courseTitle = c.title || 'Course';
      const grade = c.grade || '';
      const defaultTime = c.teacherClassTime || c.classTime || '';
      const joinLink = c.joinLink || '';
      const noOfClasses = c.noOfClasses ?? 0;

      let matched = false;

      // 1. Check schedules array
      if (Array.isArray(c.schedules) && c.schedules.length > 0) {
        for (const s of c.schedules) {
          const dayCandidates = [s.teacherDay, s.studentDay, s.teacherSchedule, s.studentSchedule].filter(Boolean);
          const daysFound = extractDays(dayCandidates);
          const timeFound = s.teacherTime || s.studentTime || extractTime(s.teacherSchedule) || extractTime(s.studentSchedule) || defaultTime;

          for (const d of daysFound) {
            matched = true;
            addStudentToDay(d, {
              studentId,
              studentName,
              studentImage,
              studentEmail,
              courseId,
              courseTitle,
              grade,
              time: timeFound,
              joinLink,
              noOfClasses,
              isDemo: false,
            });
          }
        }
      }

      // 2. Check classDays array or string
      if (c.classDays) {
        const daysFound = extractDays(c.classDays);
        for (const d of daysFound) {
          matched = true;
          addStudentToDay(d, {
            studentId,
            studentName,
            studentImage,
            studentEmail,
            courseId,
            courseTitle,
            grade,
            time: defaultTime,
            joinLink,
            noOfClasses,
            isDemo: false,
          });
        }
      }

      // 3. Fallback: check defaultTime string for day mentions
      if (!matched && defaultTime) {
        const daysFound = extractDays(defaultTime);
        const timeFound = extractTime(defaultTime);
        for (const d of daysFound) {
          addStudentToDay(d, {
            studentId,
            studentName,
            studentImage,
            studentEmail,
            courseId,
            courseTitle,
            grade,
            time: timeFound || defaultTime,
            joinLink,
            noOfClasses,
            isDemo: false,
          });
        }
      }
    }

    // Populate demo classes
    if (demoClasses.length > 0) {
      const dayIndexMap: Record<number, DayName> = {
        0: 'Sunday',
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
      };

      for (const demo of demoClasses) {
        if (demo.bookingDateAndTime) {
          const date = new Date(demo.bookingDateAndTime);
          if (!isNaN(date.getTime())) {
            const targetDay = dayIndexMap[date.getDay()];
            if (targetDay) {
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
              const sName = demo.studentName || (demo.studentId as any)?.fullName || 'Demo Student';
              addStudentToDay(targetDay, {
                studentId: (demo.studentId as any)?._id?.toString() || demo._id.toString(),
                studentName: sName,
                studentImage: (demo.studentId as any)?.profileImage || '',
                studentEmail: (demo.studentId as any)?.email || '',
                courseId: demo._id.toString(),
                courseTitle: `${demo.subject || 'Demo'} (Demo)`,
                grade: demo.grade || '',
                time: timeStr,
                joinLink: demo.joinLink || '',
                noOfClasses: 1,
                isDemo: true,
              });
            }
          }
        }
      }
    }

    const DAYS_ORDER: { dayName: DayName; shortName: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'; dayIndex: number }[] = [
      { dayName: 'Monday', shortName: 'Mon', dayIndex: 1 },
      { dayName: 'Tuesday', shortName: 'Tue', dayIndex: 2 },
      { dayName: 'Wednesday', shortName: 'Wed', dayIndex: 3 },
      { dayName: 'Thursday', shortName: 'Thu', dayIndex: 4 },
      { dayName: 'Friday', shortName: 'Fri', dayIndex: 5 },
      { dayName: 'Saturday', shortName: 'Sat', dayIndex: 6 },
      { dayName: 'Sunday', shortName: 'Sun', dayIndex: 0 },
    ];

    const weeklySchedule = DAYS_ORDER.map(({ dayName, shortName, dayIndex }) => ({
      dayName,
      shortName,
      dayIndex,
      students: scheduleMap[dayName],
    }));

    const responseData = {
      teacher: {
        ...teacher,
        experience: (teacher as any).experience || (teacher as any).experiance || '',
      },
      courses,
      weeklySchedule,
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
