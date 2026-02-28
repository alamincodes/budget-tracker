import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlannedItem extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  year: number;
  month: number;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: mongoose.Schema.Types.ObjectId;
  note?: string;
  status: 'pending' | 'done';
  transactionId?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlannedItemSchema: Schema<IPlannedItem> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
  },
  { timestamps: true }
);

PlannedItemSchema.index({ userId: 1, year: 1, month: 1 });

const PlannedItem: Model<IPlannedItem> =
  mongoose.models.PlannedItem || mongoose.model<IPlannedItem>('PlannedItem', PlannedItemSchema);

export default PlannedItem;
