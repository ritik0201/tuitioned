import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const orderSchema = z.object({
  amount: z.number().positive(),
  receipt: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid request body", errors: validation.error.issues }, { status: 400 });
    }

    const { amount, receipt } = validation.data;

    const razorpay = new Razorpay({
      key_id: process.env.RP_KEY_ID!,
      key_secret: process.env.RP_KEY_SECRET!,
    });

    // Convert amount from rupees to paise. Razorpay expects an integer.
    // Using Math.round() prevents floating point inaccuracies.
    const amountInPaise = Math.round(amount * 100); 

    const options = {
      amount: amountInPaise, // e.g., 500.50 becomes 50050
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ success: false, message: "Failed to create Razorpay order" }, { status: 500 });
  }
}