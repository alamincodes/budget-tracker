"use client";

import { useState } from "react";
import {
  TransactionWithCategory,
  useTransactions,
} from "@/hooks/useTransactions";
import { format } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import EditTransactionDialog from "./edit-transaction-dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  year: number;
  month: number;
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {transactions.length}{" "}
          {transactions.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions this month
            </p>
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
}: {
  transaction: TransactionWithCategory;
  isLast: boolean;
}) {
  const { deleteTransaction } = useTransactions({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const isIncome = t.type === "income";

  const handleDelete = () => {
    deleteTransaction.mutate({ id: String(t._id), date: t.date });
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
          !isLast && "border-b border-border",
        )}
      >
        {/* Category avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white"
          style={{
            backgroundColor:
              `${t.categoryId?.color}20` || "var(--muted-foreground)",
            color: t.categoryId?.color,
          }}
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
            isIncome ? "text-[var(--income)]" : "text-[var(--expense)]",
          )}
        >
          {isIncome ? "+" : "−"}৳{t.amount.toLocaleString()}
        </span>

        {/* Actions — always visible */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit transaction"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete transaction"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit dialog — controlled externally */}
      <EditTransactionDialog
        transaction={t}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isPending={deleteTransaction.isPending}
        title="Delete transaction?"
        description={`This will permanently remove the ৳${t.amount.toLocaleString()} ${t.type} transaction. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
