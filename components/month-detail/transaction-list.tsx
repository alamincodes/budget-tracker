"use client";

import { useState } from "react";
import { TransactionWithCategory, useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EditTransactionDialog from "./edit-transaction-dialog";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  year: number;
  month: number;
}

export default function TransactionList({ transactions, year, month }: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No transactions this month</p>
            <p className="text-xs text-muted-foreground mt-1 opacity-60">
              Add one using the button above
            </p>
          </div>
        ) : (
          transactions.map((t, idx) => (
            <TransactionRow
              key={String(t._id)}
              transaction={t}
              isLast={idx === transactions.length - 1}
              year={year}
              month={month}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionRow({
  transaction: t,
  isLast,
  year,
  month,
}: {
  transaction: TransactionWithCategory;
  isLast: boolean;
  year: number;
  month: number;
}) {
  const { deleteTransaction } = useTransactions({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isIncome = t.type === "income";

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteTransaction.mutate({ id: String(t._id), date: t.date });
    setConfirmDelete(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
        !isLast && "border-b border-border"
      )}
    >
      {/* Category avatar */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
        style={{ backgroundColor: t.categoryId?.color || "var(--muted-foreground)" }}
      >
        {t.categoryId?.name?.[0]?.toUpperCase() ?? "?"}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {t.categoryId?.name || "Uncategorized"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {format(new Date(t.date), "MMM d, yyyy")}
          {t.note ? ` · ${t.note}` : ""}
        </p>
      </div>

      {/* Amount */}
      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isIncome ? "text-[var(--income)]" : "text-[var(--expense)]"
        )}
      >
        {isIncome ? "+" : "−"}৳{t.amount.toLocaleString()}
      </span>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditTransactionDialog transaction={t} />

        {confirmDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleteTransaction.isPending}
            className="flex h-7 items-center gap-1 rounded-lg bg-destructive/10 px-2 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white"
          >
            {deleteTransaction.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Confirm?"
            )}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            aria-label="Delete transaction"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
