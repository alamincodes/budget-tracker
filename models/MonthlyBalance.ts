import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMonthlyBalance extends Document {
  userId: mongoose.Types.ObjectId;
  year: number;
  month: number; // 1–12
  openingBalance: number;
}

const MonthlyBalanceSchema = new Schema<IMonthlyBalance>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    // Balance carried in from all months before this one.
    // closingBalance = openingBalance + income(month) - expense(month)
    openingBalance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

MonthlyBalanceSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

const MonthlyBalance: Model<IMonthlyBalance> =
  mongoose.models.MonthlyBalance ||
  mongoose.model<IMonthlyBalance>('MonthlyBalance', MonthlyBalanceSchema);

export default MonthlyBalance;
