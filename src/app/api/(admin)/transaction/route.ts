import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { Types } from 'mongoose';

interface PopulatedTransaction {
  _id: Types.ObjectId;
  userId: { fullName: string } | null;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId: string;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const transactions = await Transaction.find({})
      .populate({
        path: 'userId',
        model: User,
        select: 'fullName',
      })
      .sort({ createdAt: -1 })
      .lean<PopulatedTransaction[]>();

    const formattedTransactions = transactions.map(tx => {
      if (!tx.userId) {
        return {
          id: tx._id.toString(),
          studentName: 'N/A',
          amount: tx.amount,
          status: tx.paymentStatus,
          paymentId: tx.transactionId,
          date: tx.createdAt,
        };
      }

      return {
        id: tx._id.toString(),
        studentName: tx.userId.fullName,
        amount: tx.amount,
        status: tx.paymentStatus,
        paymentId: tx.transactionId,
        date: tx.createdAt,
      };
    });

    return NextResponse.json(formattedTransactions, {
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (error) {
    console.error('[GET_TRANSACTIONS_MONGO]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
