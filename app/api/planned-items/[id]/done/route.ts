import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlannedItem from '@/models/PlannedItem';
import Transaction from '@/models/Transaction';
import { getAuthUser } from '@/lib/auth';

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

    const item = await PlannedItem.findById(id);

    if (!item || String(item.userId) !== String(user.userId)) {
      return NextResponse.json({ error: 'Planned item not found' }, { status: 404 });
    }

    if (item.status === 'done') {
      return NextResponse.json(
        { error: 'Already marked as done' },
        { status: 400 }
      );
    }

    // Use UTC so the stored date's month is correct in all timezones (year overview uses $month in UTC).
    const monthIndex = item.month >= 1 && item.month <= 12 ? item.month - 1 : 0;
    const date = new Date(Date.UTC(item.year, monthIndex, 1, 12, 0, 0));

    const transaction = await Transaction.create({
      amount: item.amount,
      type: item.type,
      categoryId: item.categoryId,
      note: item.title + (item.note ? ` · ${item.note}` : ''),
      date,
      userId: user.userId,
    } as any);

    await PlannedItem.updateOne(
      { _id: item._id } as any,
      { $set: { status: 'done', transactionId: transaction._id } }
    );

    const populated = await PlannedItem.findById(item._id).populate(
      'categoryId',
      'name icon color type'
    );

    return NextResponse.json(populated);
  } catch (error) {
    console.error('Error marking planned item done:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
