import mongoose, { Schema, Document, Types, models, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  fullName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    country?: string;
  };
  otp?: string;
  otpExpires?: Date;
  isVerified: boolean;
  role: 'student' | 'teacher' | 'admin';
  provider: 'google' | 'credentials';
  isAcceptingMessages?: boolean;
  // messages?: [string];
  qualification?: string;
  experiance?: string;
  listOfSubjects?: string[];
  profileImage?: string;
  cvUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  dateOfBirth: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
  },
  qualification: { type: String },
  experiance: { type: String },
  listOfSubjects: { type: [String] },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  provider: { type: String, enum: ['google', 'credentials'], default: 'credentials' },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String },
  cvUrl: { type: String },
  isAcceptingMessages: { type: Boolean, default: true },
  // messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, { timestamps: true });

const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
