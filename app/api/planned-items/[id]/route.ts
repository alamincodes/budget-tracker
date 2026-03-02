import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlannedItem from '@/models/PlannedItem';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
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
    const body = await req.json();
    const { title, type, amount, categoryId, note } = body;

    const item = await PlannedItem.findOne({ _id: id, userId: user.userId });
    if (!item) {
      return NextResponse.json({ error: 'Planned item not found' }, { status: 404 });
    }

    if (title !== undefined) item.title = title.trim();
    if (type !== undefined) item.type = type;
    if (amount !== undefined) item.amount = Number(amount);
    if (categoryId !== undefined) item.categoryId = categoryId;
    if (note !== undefined) item.note = note?.trim() || undefined;

    await item.save();
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating planned item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json({ error: 'Planned item ID required' }, { status: 400 });
    }

    await connectDB();

    const item = await PlannedItem.findById(id);

    if (!item || String(item.userId) !== String(user.userId)) {
      return NextResponse.json({ error: 'Planned item not found' }, { status: 404 });
    }

    await PlannedItem.deleteOne({ _id: id } as any);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting planned item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
