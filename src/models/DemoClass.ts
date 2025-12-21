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
  date: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.models.DemoClass || mongoose.model<IDemoClass>('DemoClass', DemoClassSchema);