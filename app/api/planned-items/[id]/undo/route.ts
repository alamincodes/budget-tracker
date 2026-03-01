import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlannedItem from '@/models/PlannedItem';
import Transaction from '@/models/Transaction';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { dhakaYearMonth, recalculateFromMonth } from '@/lib/monthly-balance';

export async function PATCH(
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
      return NextResponse.json({ error: 'Planned item ID required' }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);
    const item = await PlannedItem.findById(id).populate('categoryId', 'name icon color type');

    if (!item || String(item.userId) !== String(user.userId)) {
      return NextResponse.json({ error: 'Planned item not found' }, { status: 404 });
    }

    if (item.status !== 'done' || !item.transactionId) {
      return NextResponse.json(
        { error: 'Item is not marked as done' },
        { status: 400 }
      );
    }

    const linkedTx = await Transaction.findById(item.transactionId);
    const txDate = linkedTx?.date;

    await Transaction.findByIdAndDelete(item.transactionId);

    await PlannedItem.updateOne(
      { _id: id },
      { $set: { status: 'pending' }, $unset: { transactionId: 1 } }
    );

    const populated = await PlannedItem.findById(id).populate(
      'categoryId',
      'name icon color type'
    );

    if (txDate) {
      const { year, month } = dhakaYearMonth(txDate);
      await recalculateFromMonth(userId, year, month);
    }

    return NextResponse.json(populated);
  } catch (error) {
    console.error('Error undoing planned item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
