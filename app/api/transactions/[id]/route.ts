import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import PlannedItem from '@/models/PlannedItem';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { dhakaYearMonth, recalculateFromMonth } from '@/lib/monthly-balance';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const { amount, type, categoryId, note, date } = await req.json();

    // Fetch original so we know the old date (needed to pick the correct
    // recalculation start month when the date is being changed).
    const userId = new mongoose.Types.ObjectId(user.userId);
    const original = await Transaction.findOne({ _id: id, userId });
    if (!original) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      {
        ...(amount !== undefined && { amount }),
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(note !== undefined && { note }),
        ...(date && { date: new Date(date) }),
      },
      { new: true }
    ).populate('categoryId', 'name icon color type');

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Recalculate from the earliest affected Dhaka month.
    const oldMonthInfo = dhakaYearMonth(original.date);
    const newDate = date ? new Date(date) : original.date;
    const newMonthInfo = dhakaYearMonth(newDate);

    const startYear =
      oldMonthInfo.year < newMonthInfo.year ||
      (oldMonthInfo.year === newMonthInfo.year &&
        oldMonthInfo.month <= newMonthInfo.month)
        ? oldMonthInfo.year
        : newMonthInfo.year;
    const startMonth =
      startYear === oldMonthInfo.year && startYear === newMonthInfo.year
        ? Math.min(oldMonthInfo.month, newMonthInfo.month)
        : startYear === oldMonthInfo.year
          ? oldMonthInfo.month
          : newMonthInfo.month;

    await recalculateFromMonth(userId, startYear, startMonth);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);
    const transaction = await Transaction.findOne({ _id: id, userId });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const txDate = transaction.date;
    await Transaction.findByIdAndDelete(id);

    // Reset any planned item that was linked to this transaction.
    await PlannedItem.updateOne(
      { transactionId: id },
      { $unset: { transactionId: 1 }, $set: { status: 'pending' } }
    );

    const { year, month } = dhakaYearMonth(txDate);
    await recalculateFromMonth(userId, year, month);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
