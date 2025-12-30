import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface ICourseMessage extends Document {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  attachmentUrl?: string;
  attachmentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseMessageSchema: Schema<ICourseMessage> = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
    },
    attachmentType: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d', // Automatically delete documents after 30 days
    },
  },
  { timestamps: true }
);

const CourseMessage: Model<ICourseMessage> =
  models.CourseMessage || mongoose.model<ICourseMessage>("CourseMessage", CourseMessageSchema);

export default CourseMessage;
