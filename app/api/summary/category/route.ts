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
    const type = searchParams.get('type'); // 'income' or 'expense'

    const matchStage: any = { userId: new mongoose.Types.ObjectId(user.userId) };

    if (from && to) {
      matchStage.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    if (type) {
      matchStage.type = type;
    }

    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          color: '$category.color',
          icon: '$category.icon',
          type: '$category.type',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching category summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
