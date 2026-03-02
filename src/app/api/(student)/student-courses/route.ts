import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import Course from "@/models/Course";

import { authOptions } from '@/lib/auth';
import dbConnect from "@/lib/dbConnect";
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await dbConnect();
    const courses = await Course.find({

        studentId: session.user.id,
      },
    )

    return NextResponse.json(courses)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
