import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import PlannedItem from '@/models/PlannedItem';
import { getAuthUser } from '@/lib/auth';

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

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: user.userId } as any,
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

    const transaction = await Transaction.findById(id);

    if (!transaction || String(transaction.userId) !== String(user.userId)) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await Transaction.findByIdAndDelete(id);

    // If this transaction was created from a planned item, reset the planned item
    await PlannedItem.updateOne(
      { transactionId: id } as any,
      { $unset: { transactionId: 1 }, $set: { status: 'pending' } }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
