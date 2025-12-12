import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendOtpEmail } from "@/lib/sendOtp";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const {
      fullName,
      email,
      mobile,
      qualification,
      experiance,
      listOfSubjects,
      profileImage,
      cvUrl,
    } = await request.json();

    if (!fullName || !email) {
      return NextResponse.json({ message: "Full name and email are required" }, { status: 400 });
    }
    // this is testing phase
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.role === 'teacher') {
      return NextResponse.json({ message: "User already exists. Please login." }, { status: 409 });
    }


    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = new User({
      fullName,
      email,
      mobile,
      qualification,
      experiance,
      listOfSubjects,
      profileImage,
      cvUrl,
      isVerified: false,
      role: "teacher",
    });

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(email, otp);
    return NextResponse.json({ message: "OTP sent successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("Teacher Signup Error:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
