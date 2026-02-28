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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Use Asia/Dhaka so "January" is the same everywhere (Dec 31 18:00 UTC = Jan 1 in Dhaka).
    const tz = 'Asia/Dhaka';
    const startOfYearTz = new Date(Date.UTC(year - 1, 11, 31, 18, 0, 0, 0)); // Jan 1 00:00 Dhaka
    const endOfYearTz = new Date(Date.UTC(year, 11, 31, 17, 59, 59, 999));   // Dec 31 23:59:59 Dhaka

    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user.userId),
          date: { $gte: startOfYearTz, $lte: endOfYearTz },
        },
      },
      {
        $addFields: {
          parts: { $dateToParts: { date: '$date', timezone: tz } },
        },
      },
      { $match: { 'parts.year': year } },
      {
        $group: {
          _id: {
            month: '$parts.month',
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.month': 1 },
      },
    ]);

    // Format result: array of 12 months, each with income/expense
    const result = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    summary.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === 'income') {
        result[monthIndex].income = item.total;
      } else {
        result[monthIndex].expense = item.total;
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching year summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
