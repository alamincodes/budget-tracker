import mongoose from 'mongoose';
import Transaction from '@/models/Transaction';
import MonthlyBalance from '@/models/MonthlyBalance';

/**
 * Month boundary helpers for Asia/Dhaka (UTC+6).
 *
 * start = midnight of day 1 in Dhaka  = Date.UTC(year, month-1, 0, 18)
 * end   = 23:59:59.999 of last day     = Date.UTC(year, month,   0, 17, 59, 59, 999)
 *
 * Why day 0? JavaScript Date treats day 0 as the last day of the previous month,
 * so Date.UTC(2026, 1, 0, 18) = Jan 31 18:00 UTC = Feb 1 00:00 Dhaka.
 */
export function monthBoundsDhaka(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 0, 18, 0, 0, 0)),
    end: new Date(Date.UTC(year, month, 0, 17, 59, 59, 999)),
  };
}

/** Convert a UTC Date to the Dhaka (year, month) it falls in. */
export function dhakaYearMonth(date: Date): { year: number; month: number } {
  const d = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/** Advance one calendar month (handles Dec → Jan roll-over). */
export function advanceMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/** Sum (income - expense) for a specific Dhaka calendar month. */
async function monthNet(
  userId: mongoose.Types.ObjectId,
  year: number,
  month: number,
): Promise<number> {
  const { start, end } = monthBoundsDhaka(year, month);
  const rows: { _id: string; total: number }[] = await Transaction.aggregate([
    { $match: { userId, date: { $gte: start, $lte: end } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let inc = 0,
    exp = 0;
  for (const r of rows) {
    if (r._id === 'income') inc = r.total;
    else if (r._id === 'expense') exp = r.total;
  }
  return inc - exp;
}

/**
 * Return the opening balance for (year, month) — i.e. the cumulative balance
 * from ALL transactions before this month's first day.
 *
 * Uses the stored MonthlyBalance record if it exists; otherwise computes it
 * from scratch and caches the result for future requests.
 */
export async function getOpeningBalance(
  userId: mongoose.Types.ObjectId,
  year: number,
  month: number,
): Promise<number> {
  const record = await MonthlyBalance.findOne({ userId, year, month }).lean();
  if (record) return record.openingBalance;

  const { start } = monthBoundsDhaka(year, month);
  const rows: { _id: string; total: number }[] = await Transaction.aggregate([
    { $match: { userId, date: { $lt: start } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let opening = 0;
  for (const r of rows) {
    if (r._id === 'income') opening += r.total;
    else if (r._id === 'expense') opening -= r.total;
  }

  await MonthlyBalance.findOneAndUpdate(
    { userId, year, month },
    { $set: { openingBalance: opening } },
    { upsert: true },
  );
  return opening;
}

/**
 * Recalculate and persist MonthlyBalance records from (year, month) through
 * the current calendar month.
 *
 * Must be called after any transaction is created, updated, or deleted so
 * that all downstream months stay consistent.
 */
export async function recalculateFromMonth(
  userId: mongoose.Types.ObjectId,
  year: number,
  month: number,
): Promise<void> {
  // Compute a fresh opening balance by scanning all prior transactions.
  const { start } = monthBoundsDhaka(year, month);
  const priorRows: { _id: string; total: number }[] = await Transaction.aggregate([
    { $match: { userId, date: { $lt: start } } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let opening = 0;
  for (const r of priorRows) {
    if (r._id === 'income') opening += r.total;
    else if (r._id === 'expense') opening -= r.total;
  }

  // Cascade forward: update each month's opening balance up to today.
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  let cur = { year, month };
  let curOpening = opening;

  while (
    cur.year < curYear ||
    (cur.year === curYear && cur.month <= curMonth)
  ) {
    await MonthlyBalance.findOneAndUpdate(
      { userId, year: cur.year, month: cur.month },
      { $set: { openingBalance: curOpening } },
      { upsert: true },
    );
    curOpening += await monthNet(userId, cur.year, cur.month);
    cur = advanceMonth(cur.year, cur.month);
  }
}
