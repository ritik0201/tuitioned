import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/Course";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      classesToAdd, // Corrected from classesAdded to match the frontend payload
    } = await request.json();

    // 1. Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RP_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { message: "Invalid payment signature." },
        { status: 400 }
      );
    }

    // 2. Find and update the course
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    // Security check: ensure the user owns this course
    if (course.studentId.toString() !== session.user.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Safely update the number of classes
    const currentClasses = course.noOfClasses || 0;
    const classesToAddNumeric = Number(classesToAdd);

    // Ensure we are adding a valid number
    course.noOfClasses = currentClasses + (isNaN(classesToAddNumeric) ? 0 : classesToAddNumeric);
    await course.save();

    // 3. Send a success email
    if (session.user.email) {
      await sendEmail({
        to: session.user.email,
        subject: "Classes Added Successfully!",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classes Added Successfully!</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #22c55e; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Successful!</h2>
        </div>
        <div class="content">
            <p>Hi ${session.user.name || 'Student'},</p>
            <p>We're thrilled to confirm that <strong>${classesToAddNumeric}</strong> new classes have been successfully added to your course: <strong>${course.title}</strong>.</p>
            <p>Your updated total class count is now <strong>${course.noOfClasses}</strong>.</p>
            <p>You can now access your course and schedule your new classes. Happy learning!</p>
            <p style="text-align: center; margin-top: 25px;"><a href="${process.env.NEXT_PUBLIC_BASE_URL}/student/courses/${course._id}" class="button">View My Course</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TuitionEd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
        ,
      });
    }

    return NextResponse.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Error updating course after payment:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
