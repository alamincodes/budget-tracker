import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction, { ITransaction } from '@/models/Transaction';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { dhakaYearMonth, recalculateFromMonth } from '@/lib/monthly-balance';

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
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');

    const query: {
      userId: mongoose.Types.ObjectId;
      date?: { $gte: Date; $lte: Date };
      type?: string;
      categoryId?: string;
    } = { userId: new mongoose.Types.ObjectId(user.userId) };

    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }
    if (type) query.type = type;
    if (categoryId) query.categoryId = categoryId;

    const transactions = await Transaction.find(
      query as unknown as mongoose.QueryFilter<ITransaction>
    )
      .populate('categoryId', 'name icon color type')
      .sort({ date: -1, createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { amount, type, categoryId, note, date } = await req.json();

    if (!amount || !type || !categoryId || !date) {
      return NextResponse.json(
        { error: 'Amount, type, categoryId, and date are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user.userId);
    const txDate = new Date(date);

    const transaction = await Transaction.create({
      amount,
      type,
      categoryId,
      note,
      date: txDate,
      userId,
    } as Parameters<typeof Transaction.create>[0]);

    // Keep MonthlyBalance in sync so future balance lookups are fast.
    const { year, month } = dhakaYearMonth(txDate);
    await recalculateFromMonth(userId, year, month);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
