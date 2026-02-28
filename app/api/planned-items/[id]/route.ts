import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlannedItem from '@/models/PlannedItem';
import { getAuthUser } from '@/lib/auth';

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
