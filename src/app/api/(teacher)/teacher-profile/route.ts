import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * @swagger
 * /api/teacher-profile:
 *   get:
 *     summary: Get teacher profile
 *     description: Retrieves the profile information for the currently logged-in teacher.
 *     tags: [Teacher]
 *     responses:
 *       200:
 *         description: Successfully retrieved teacher profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 profile:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const teacher = await User.findById(session.user.id)
      .select('fullName email mobile dateOfBirth address qualification experience listOfSubjects')
      .lean();

    if (!teacher) {
      return NextResponse.json({ success: false, message: 'Teacher not found' }, { status: 404 });
    }

    const profile = {
      fullName: teacher.fullName,
      email: teacher.email,
      mobile: teacher.mobile || '',
      dateOfBirth: teacher.dateOfBirth || null,
      address: teacher.address || { street: '', city: '', state: '' },
      qualification: teacher.qualification || '',
      experience: teacher.experiance || '',
      listOfSubjects: teacher.listOfSubjects || [],
    };

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/teacher-profile:
 *   put:
 *     summary: Update teacher profile
 *     description: Updates the profile information for the currently logged-in teacher. The email address cannot be changed.
 *     tags: [Teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'teacher') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const teacherId = session.user.id;
    const body = await request.json();

    // email is intentionally omitted to prevent it from being updated
    const { fullName, mobile, dateOfBirth, address, qualification, experience, listOfSubjects } = body;

    const updatedUser = await User.findByIdAndUpdate(teacherId, {
      $set: { fullName, mobile, dateOfBirth, address, qualification, experience, listOfSubjects },
    }, { new: true, runValidators: true });

    return NextResponse.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}