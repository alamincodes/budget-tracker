"use client";

import { TransactionWithCategory } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
        <span className="text-xs text-muted-foreground">{transactions.length} entries</span>
      </div>
      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No transactions this month</p>
          </div>
        ) : (
          transactions.map((t, idx) => (
            <div
              key={String(t._id)}
              className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                idx !== transactions.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
                  style={{ backgroundColor: t.categoryId?.color || "var(--muted-foreground)" }}
                >
                  {t.categoryId?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.categoryId?.name || "Uncategorized"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {format(new Date(t.date), "MMM d")}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  t.type === "income" ? "text-[var(--income)]" : "text-[var(--expense)]"
                )}
              >
                {t.type === "income" ? "+" : "−"}৳{t.amount.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
