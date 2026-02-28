import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlannedItem from '@/models/PlannedItem';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'year and month are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const yearNum = parseInt(year, 10);
    const monthNum = Math.min(12, Math.max(1, parseInt(month, 10)));
    const items = await PlannedItem.find({
      userId: user.userId,
      year: yearNum,
      month: monthNum,
    } as any)
      .populate('categoryId', 'name icon color type')
      .sort({ type: 1, createdAt: 1 });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching planned items:', error);
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

    const body = await req.json();
    const { year, month, title, type, amount, categoryId, note } = body;

    if (!year || !month || !title || !type || amount == null || !categoryId) {
      return NextResponse.json(
        { error: 'year, month, title, type, amount, and categoryId are required' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const yearNum = parseInt(year, 10);
    const monthNum = Math.min(12, Math.max(1, parseInt(month, 10)));
    const item = await PlannedItem.create({
      userId: user.userId as any,
      year: yearNum,
      month: monthNum,
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      categoryId,
      note: note?.trim() || undefined,
      status: 'pending',
    });

    const populated = await PlannedItem.findById(item._id).populate(
      'categoryId',
      'name icon color type'
    );

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Error creating planned item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
