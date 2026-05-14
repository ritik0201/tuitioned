/**
 * Represents basic user information, typically for populated fields.
 */
export interface UserInfo {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
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
  classTime?: string;
  classDays?: string[];
  paymentStatus?: "pending" | "completed" | "failed";
  teacherId: UserInfo;
  studentId: UserInfo;
  createdAt: string;
  joinLink?: string;
  classroomLink?: string;
  teacherPerClassPrice?: number;
  noOfclassTeacher?: number;
}