/**
 * Represents basic user information, typically for populated fields.
 */
export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
}

export interface ScheduleItem {
  studentSchedule?: string;
  teacherSchedule?: string;
  studentDay?: string;
  studentTime?: string;
  teacherDay?: string;
  teacherTime?: string;
}

/**
 * Represents the detailed structure of a course, including populated user info.
 */
export interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  grade: string;
  noOfClasses: number;
  perClassPrice: number;
  currency?: string;
  classTime?: string;
  teacherClassTime?: string;
  classDays?: string[];
  schedules?: ScheduleItem[];
  paymentStatus?: "pending" | "completed" | "failed";
  teacherId: UserInfo;
  studentId: UserInfo;
  createdAt: string;
  joinLink?: string;
  classroomLink?: string;
  teacherPerClassPrice?: number;
  noOfclassTeacher?: number;
}