import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDemoClass extends Document {
  studentId: Types.ObjectId;
  teacherId?: Types.ObjectId;
  joinLink?: string;
  fatherName: string;
  subject: string;
  topic?: string;
  grade: string;
  city: string;
  country: string;
  bookingDateAndTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  timeZone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DemoClassSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  joinLink: { type: String },
  fatherName: { type: String , required: true },
  grade: { type: String, required: true },
  city: { type: String},
  country: { type: String},
  topic: { type: String },
  subject: { type: String, required: true },
  bookingDateAndTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  timeZone: { type: String },
}, { timestamps: true });

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.DemoClass;
}

export default mongoose.models.DemoClass || mongoose.model<IDemoClass>('DemoClass', DemoClassSchema);