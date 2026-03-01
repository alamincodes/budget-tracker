import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { getOpeningBalance, dhakaYearMonth } from '@/lib/monthly-balance';

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

    // Opening balance = cumulative balance from all transactions before `from`.
    // Uses MonthlyBalance cache when `from` aligns with a Dhaka month start (the
    // common "monthly" filter). Falls back to a direct aggregation otherwise.
    let openingBalance = 0;
    if (from) {
      const fromDate = new Date(from);
      const { year, month } = dhakaYearMonth(fromDate);

      // Check whether `from` is exactly the start of that Dhaka month.
      // monthBoundsDhaka start = Date.UTC(year, month-1, 0, 18) — compare ms.
      const expectedStart = new Date(Date.UTC(year, month - 1, 0, 18, 0, 0, 0));
      if (fromDate.getTime() === expectedStart.getTime()) {
        // Fast path: use stored (or lazily computed) MonthlyBalance record.
        openingBalance = await getOpeningBalance(userId, year, month);
      } else {
        // Slow path: scan all transactions before `from` (for non-month filters).
        const rows: { _id: string; total: number }[] = await Transaction.aggregate([
          { $match: { userId, date: { $lt: fromDate } } },
          { $group: { _id: '$type', total: { $sum: '$amount' } } },
        ]);
        for (const r of rows) {
          if (r._id === 'income') openingBalance += r.total;
          else if (r._id === 'expense') openingBalance -= r.total;
        }
      }
    }

    const balance = openingBalance + (income - expense);
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
