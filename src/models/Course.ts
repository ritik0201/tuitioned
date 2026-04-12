import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICourse extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  title: string;
  description: string;
  grade: string;
  classTime: string;
  classDays:  string[];
  noOfClasses: number;
  perClassPrice: number;
  noOfclassTeacher?: number;
  teacherPerClassPrice?: number;
  joinLink: string;
  classroomLink?: string;
  teacherId: Types.ObjectId;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true }, // Renamed from Subject for consistency
  description: { type: String, default: '' },
  grade: { type: String, required: true },
  classTime: { type: String },
  classDays: { type: [String] },
  noOfClasses: { type: Number, default: 0},
  noOfclassTeacher: { type: Number, default: 0 },
  perClassPrice: { type: Number, required: true },
  teacherPerClassPrice: { type: Number, default: 0 },
  joinLink: { type: String },
  classroomLink: { type: String },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional teacher assignment
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

// Check if model already exists to avoid OverwriteModelError in development
export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);