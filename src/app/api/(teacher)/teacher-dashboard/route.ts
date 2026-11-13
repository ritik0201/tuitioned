import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Course from '@/models/Course';
import CompletedClass from '@/models/CompletedClass';
import DemoClass from '@/models/DemoClass';
import User from '@/models/User';

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

function parseTimeToDate(timeStr: string, baseDate: Date = new Date()): Date | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3] ? match[3].toUpperCase() : null;

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const teacherId = session?.user?.id;

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all courses for the teacher
    const courses = await Course.find({ teacherId }).populate('studentId', 'fullName profileImage email');

    // Calculate total earnings
    const totalEarnings = courses.reduce((acc, course) => {
      const earningsForCourse = (course.noOfclassTeacher || 0) * (course.teacherPerClassPrice || 0);
      return acc + earningsForCourse;
    }, 0);

    // Get total unique students (safely checking studentId)
    const validStudentCourses = courses.filter(course => course.studentId && course.studentId._id);
    const studentIds = new Set(validStudentCourses.map(course => course.studentId._id.toString()));
    const totalStudents = studentIds.size;

    // Get active courses (assuming active means classes are left)
    const activeCourses = courses.filter(course => (course.noOfClasses ?? 0) > 0).length;

    // Get total classes left across all courses
    const totalClasses = courses.reduce((acc, course) => acc + (course.noOfClasses || 0), 0);

    // Get recent courses (last 5 updated)
    const recentCourses = await Course.find({ teacherId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('studentId', 'fullName profileImage email');

    // Get recent activity (last 5 completed classes)
    const recentActivity = await CompletedClass.find({ teacherId })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('studentId', 'fullName');

    // Fetch confirmed/pending demo classes assigned to teacher
    let demoClasses: any[] = [];
    try {
      demoClasses = await DemoClass.find({
        teacherId,
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
      const student = course.studentId;
      const studentId = student._id?.toString() || '';
      const studentName = student.fullName || 'Student';
      const studentImage = student.profileImage || '';
      const studentEmail = student.email || '';
      const courseId = course._id.toString();
      const courseTitle = course.title || 'Course';
      const grade = course.grade || '';
      const defaultTime = course.teacherClassTime || course.classTime || '';
      const joinLink = course.joinLink || '';
      const noOfClasses = course.noOfClasses ?? 0;

      let matched = false;

      // 1. Check schedules array
      if (Array.isArray(course.schedules) && course.schedules.length > 0) {
        for (const s of course.schedules) {
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
      if (course.classDays) {
        const daysFound = extractDays(course.classDays);
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
              const sName = demo.studentName || demo.studentId?.fullName || 'Demo Student';
              addStudentToDay(targetDay, {
                studentId: demo.studentId?._id?.toString() || demo._id.toString(),
                studentName: sName,
                studentImage: demo.studentId?.profileImage || '',
                studentEmail: demo.studentId?.email || '',
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

    // Build Upcoming & Today's Classes (Next 24 Hours window)
    const now = new Date();
    const DAY_NAMES: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = DAY_NAMES[now.getDay()];
    const tomorrowDayName = DAY_NAMES[(now.getDay() + 1) % 7];

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfNext24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fetch classes completed today by this teacher
    let todayCompletedClasses: any[] = [];
    try {
      todayCompletedClasses = await CompletedClass.find({
        teacherId,
        completedAt: { $gte: startOfToday },
      }).lean();
    } catch (err) {
      // CompletedClass query optional
    }

    const upcomingClasses: any[] = [];

    const addUpcomingClass = (item: any, scheduledDay: 'Today' | 'Tomorrow', baseDate: Date) => {
      const parsedStart = parseTimeToDate(item.time, baseDate);
      const startTime = parsedStart || new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 10, 0, 0);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const isCompleted = todayCompletedClasses.some(
        c => c.courseId?.toString() === item.courseId?.toString()
      );

      let status: 'live' | 'upcoming' | 'completed' | 'ended';
      if (isCompleted) {
        status = 'completed';
      } else if (scheduledDay === 'Today') {
        if (now >= startTime && now <= endTime) {
          status = 'live';
        } else if (now < startTime) {
          status = 'upcoming';
        } else {
          status = 'ended';
        }
      } else {
        status = 'upcoming';
      }

      upcomingClasses.push({
        courseId: item.courseId,
        studentId: item.studentId,
        studentName: item.studentName,
        studentImage: item.studentImage,
        studentEmail: item.studentEmail,
        courseTitle: item.courseTitle,
        grade: item.grade,
        time: item.time,
        scheduledDay,
        startTimeIso: startTime.toISOString(),
        endTimeIso: endTime.toISOString(),
        status,
        joinLink: item.joinLink,
        noOfClasses: item.noOfClasses,
        isDemo: item.isDemo || false,
      });
    };

    // 1. All of TODAY's scheduled student classes (shows all students to teach today)
    const todayClasses = scheduleMap[todayDayName] || [];
    for (const item of todayClasses) {
      addUpcomingClass(item, 'Today', now);
    }

    // 2. TOMORROW's scheduled student classes within next 24 hours
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowClasses = scheduleMap[tomorrowDayName] || [];
    for (const item of tomorrowClasses) {
      const tomorrowStart = parseTimeToDate(item.time, tomorrowDate);
      if (tomorrowStart && tomorrowStart.getTime() <= endOfNext24h.getTime()) {
        addUpcomingClass(item, 'Tomorrow', tomorrowDate);
      }
    }

    // 3. Demo classes within the next 24 hours
    for (const demo of demoClasses) {
      if (demo.bookingDateAndTime) {
        const demoDate = new Date(demo.bookingDateAndTime);
        if (demoDate >= startOfToday && demoDate <= endOfNext24h) {
          const isTodayDemo = demoDate.toDateString() === now.toDateString();
          const demoEndTime = new Date(demoDate.getTime() + 60 * 60 * 1000);

          let demoStatus: 'live' | 'upcoming' | 'completed' | 'ended';
          if (demo.status === 'completed') {
            demoStatus = 'completed';
          } else if (now >= demoDate && now <= demoEndTime) {
            demoStatus = 'live';
          } else if (now < demoDate) {
            demoStatus = 'upcoming';
          } else {
            demoStatus = 'ended';
          }

          const sName = demo.studentName || (demo.studentId as any)?.fullName || 'Demo Student';
          const alreadyAdded = upcomingClasses.some(c => c.courseId === demo._id.toString());
          if (!alreadyAdded) {
            upcomingClasses.push({
              courseId: demo._id.toString(),
              studentId: (demo.studentId as any)?._id?.toString() || demo._id.toString(),
              studentName: sName,
              studentImage: (demo.studentId as any)?.profileImage || '',
              studentEmail: (demo.studentId as any)?.email || '',
              courseTitle: `${demo.subject || 'Demo'} (Demo Class)`,
              grade: demo.grade || '',
              time: demoDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
              scheduledDay: isTodayDemo ? 'Today' : 'Tomorrow',
              startTimeIso: demoDate.toISOString(),
              endTimeIso: demoEndTime.toISOString(),
              status: demoStatus,
              joinLink: demo.joinLink || '',
              noOfClasses: 1,
              isDemo: true,
            });
          }
        }
      }
    }

    // Sort: live first, then upcoming by start time, then ended, then completed
    const statusPriority: Record<string, number> = { live: 1, upcoming: 2, ended: 3, completed: 4 };
    upcomingClasses.sort((a, b) => {
      const pDiff = (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
      if (pDiff !== 0) return pDiff;
      return new Date(a.startTimeIso).getTime() - new Date(b.startTimeIso).getTime();
    });

    const dashboardData = {
      totalStudents,
      activeCourses,
      totalClasses,
      totalEarnings,
      recentCourses,
      recentActivity,
      weeklySchedule,
      upcomingClasses,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });

  } catch (error: any) {
    console.error('Error fetching teacher dashboard data:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while fetching dashboard data.',
      },
      { status: 500 }
    );
  }
}
