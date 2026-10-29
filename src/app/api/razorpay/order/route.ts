import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

const orderSchema = z.object({
  amount: z.number().positive(),
  receipt: z.string(),
  currency: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, message: "Invalid request body", errors: validation.error.issues }, { status: 400 });
    }

    const { amount, receipt, currency } = validation.data;

    const razorpay = new Razorpay({
      key_id: process.env.RP_KEY_ID!,
      key_secret: process.env.RP_KEY_SECRET!,
    });

    // Convert amount to smallest subunit (paise, cents, etc.). Razorpay expects integer.
    const amountInSubunits = Math.round(amount * 100); 

    const options = {
      amount: amountInSubunits,
      currency: (currency || "INR").toUpperCase(),
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}