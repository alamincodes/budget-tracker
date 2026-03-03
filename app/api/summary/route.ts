import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const userId = new mongoose.Types.ObjectId(user.userId);

    const matchStage: {
      userId: mongoose.Types.ObjectId;
      date?: { $gte: Date; $lte: Date };
    } = { userId };

    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    summary.forEach((item) => {
      if (item._id === 'income') income = item.total;
      if (item._id === 'expense') expense = item.total;
    });

    // Balance = net cash flow for the selected period (income − expense).
    // Opening/historical balance is intentionally excluded so that switching
    // to a past period always shows how that period performed on its own,
    // rather than a cumulative running total that would look unexpectedly
    // higher or lower than the current period's balance.
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return NextResponse.json({
      income,
      expense,
      balance,
      savingsRate: Math.max(0, savingsRate),
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
