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
    const year = parseInt(
      searchParams.get('year') || new Date().getFullYear().toString()
    );
    const userId = new mongoose.Types.ObjectId(user.userId);
    const tz = 'Asia/Dhaka';

    // Aggregate ALL-TIME net flows grouped by (Dhaka year, month).
    // This single query lets us compute running opening balances without
    // N separate scans — even 3 years of data returns at most 72 rows.
    const allMonthly: { _id: { year: number; month: number; type: string }; total: number }[] =
      await Transaction.aggregate([
        { $match: { userId } },
        {
          $addFields: {
            parts: { $dateToParts: { date: '$date', timezone: tz } },
          },
        },
        {
          $group: {
            _id: { year: '$parts.year', month: '$parts.month', type: '$type' },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

    // Build a map: "YYYY-M" → { income, expense }
    const monthMap = new Map<string, { income: number; expense: number }>();
    for (const row of allMonthly) {
      const key = `${row._id.year}-${row._id.month}`;
      if (!monthMap.has(key)) monthMap.set(key, { income: 0, expense: 0 });
      const entry = monthMap.get(key)!;
      if (row._id.type === 'income') entry.income = row.total;
      else entry.expense = row.total;
    }

    // Sort chronologically to compute cumulative balance.
    const sortedKeys = [...monthMap.keys()].sort((a, b) => {
      const [ay, am] = a.split('-').map(Number);
      const [by, bm] = b.split('-').map(Number);
      return ay !== by ? ay - by : am - bm;
    });

    // Compute the running balance up to the start of the requested year.
    let runningBalance = 0;
    for (const key of sortedKeys) {
      const [y] = key.split('-').map(Number);
      if (y >= year) break;
      const { income, expense } = monthMap.get(key)!;
      runningBalance += income - expense;
    }

    // Build result array: 12 months with income, expense, openingBalance.
    // openingBalance cascades month-to-month within the year so months with
    // no transactions still carry the correct running total forward.
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      openingBalance: 0,
    }));

    let curOpening = runningBalance;
    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${m}`;
      const data = monthMap.get(key) ?? { income: 0, expense: 0 };
      result[m - 1].income = data.income;
      result[m - 1].expense = data.expense;
      result[m - 1].openingBalance = curOpening;
      curOpening += data.income - data.expense;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching year summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
