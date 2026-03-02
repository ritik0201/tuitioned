import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { NextRequest, NextResponse } from "next/server";
import Course from "@/models/Course";
import { sendEmail } from "@/lib/sendEmail";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  try {
    const { courseId, amount, numberOfClasses, currency, paymentGateway, transactionId } = await request.json();

    if (!courseId || !amount || !numberOfClasses || !transactionId) {
      return NextResponse.json(
        { success: false, message: "Missing required transaction details." },
        { status: 400 }
      );
    }

    const newTransaction = new Transaction({
      userId: new mongoose.Types.ObjectId(session.user.id),
      courseId: new mongoose.Types.ObjectId(courseId),
      transactionId, // This will be the Razorpay Order ID
      amount,
      numberOfClasses,
      currency: currency || 'INR',
      paymentStatus: 'pending',
      paymentGateway: paymentGateway || 'Razorpay',
    });

    await newTransaction.save();

    return NextResponse.json(
      { success: true, message: "Transaction created successfully.", transaction: newTransaction },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ success: false, message: "Error creating transaction" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  // Allow admins to fetch transaction data
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: "Not Authenticated or Not an Admin" },
      { status: 401 }
    );
  }

  try {
    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ success: false, message: "Missing courseId parameter." }, { status: 400 });
    }

    const transactions = await Transaction.find({ courseId: courseId }).sort({ createdAt: -1 }).populate('userId');

    return NextResponse.json(
      { success: true, message: "Transactions fetched successfully.", transactions: transactions },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json({ success: false, message: "Error fetching transaction" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: "Not Authenticated" },
      { status: 401 }
    );
  }

  try {
    const { transactionId, status } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { success: false, message: "Transaction ID and status are required." },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findOne(
      { transactionId: transactionId },
    );

    if (!transaction) {
      return NextResponse.json({ success: false, message: "Transaction not found." }, { status: 404 });
    }

    transaction.paymentStatus = status;
    await transaction.save();

    // If the transaction failed, send an email
    if (status === 'failed' && session.user.email) {
      const course = await Course.findById(transaction.courseId);
      if (course) {
        // Construct a robust base URL that works in production (e.g., on Vercel) and locally.
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const paymentUrl = `${baseUrl}/student/courses/${course._id}?retry=true&classes=${transaction.numberOfClasses}`;

        await sendEmail({
          to: session.user.email,
          subject: "Payment Failed for Your Course",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { background-color: #ef4444; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px 0; }
        .button { display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Failed</h2>
        </div>
        <div class="content">
            <p>Hi ${session.user.name || 'Student'},</p>
            <p>Unfortunately, your recent payment attempt for the course "<strong>${course.title}</strong>" did not go through.</p>
            <p>No charges were made to your account. Please try again or contact support if you continue to experience issues.</p>
            <p style="text-align: center; margin-top: 25px;"><a href="${paymentUrl}" class="button">Retry Payment</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TuitionEd. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
        ,});
      }
    }

    return NextResponse.json({ success: true, message: "Transaction updated successfully.", transaction: transaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ success: false, message: "Error updating transaction" }, { status: 500 });
  }
}
