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

    const matchStage: any = { userId: new mongoose.Types.ObjectId(user.userId) };

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

    // Opening balance = balance from all transactions before the range start (e.g. last month's closing).
    // So "Balance" = last month's balance + (this month income - this month expense).
    let openingBalance = 0;
    if (from) {
      const opening = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(user.userId),
            date: { $lt: new Date(from) },
          },
        },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]);
      let openIncome = 0;
      let openExpense = 0;
      opening.forEach((item: { _id: string; total: number }) => {
        if (item._id === 'income') openIncome = item.total;
        if (item._id === 'expense') openExpense = item.total;
      });
      openingBalance = openIncome - openExpense;
    }

    const balance = openingBalance + (income - expense);
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return NextResponse.json({
      income,
      expense,
      balance,
      savingsRate: Math.max(0, savingsRate), // Ensure not negative if possible, or allow it. Usually savings rate is percentage of income saved. If balance is negative, savings rate is effectively negative or 0.
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
