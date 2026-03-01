"use client";

import { useState } from "react";
import {
  TransactionWithCategory,
  useTransactions,
} from "@/hooks/useTransactions";
import { format, isToday, isYesterday } from "date-fns";
import {
  Trash2,
  Pencil,
  TrendingDown,
  TrendingUp,
  StickyNote,
  CalendarDays,
  Tag,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EditTransactionDialog from "./edit-transaction-dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  year: number;
  month: number;
}

function formatGroupDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // Group by date (YYYY-MM-DD)
  const grouped = transactions.reduce<
    Record<string, TransactionWithCategory[]>
  >((acc, t) => {
    const key = format(new Date(t.date), "yyyy-MM-dd");
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});
  const sortedKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Transactions</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {transactions.length}{" "}
          {transactions.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Summary bar */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--income)/10">
              <TrendingUp className="h-3.5 w-3.5 text-(--income)" />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                Income
              </p>
              <p className="text-sm font-semibold text-(--income) tabular-nums leading-none">
                +৳{totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-(--expense)/10">
              <TrendingDown className="h-3.5 w-3.5 text-(--expense)" />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground leading-none mb-0.5">
                Expense
              </p>
              <p className="text-sm font-semibold text-(--expense) tabular-nums leading-none">
                −৳{totalExpense.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <StickyNote className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No transactions
            </p>
            <p className="text-xs text-muted-foreground mt-1 opacity-70">
              Add one using the button above
            </p>
          </div>
        ) : (
          sortedKeys.map((dateKey, gi) => {
            const group = grouped[dateKey];
            const groupIncome = group
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0);
            const groupExpense = group
              .filter((t) => t.type === "expense")
              .reduce((s, t) => s + t.amount, 0);
            const isLastGroup = gi === sortedKeys.length - 1;

            return (
              <div
                key={dateKey}
                className={cn(!isLastGroup && "border-b border-border")}
              >
                {/* Date header */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatGroupDate(dateKey)}
                  </span>
                  <div className="flex items-center gap-2.5 text-[10px] tabular-nums">
                    {groupIncome > 0 && (
                      <span className="text-(--income) font-medium">
                        +৳{groupIncome.toLocaleString()}
                      </span>
                    )}
                    {groupExpense > 0 && (
                      <span className="text-(--expense) font-medium">
                        −৳{groupExpense.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rows */}
                {group.map((t, idx) => (
                  <TransactionRow
                    key={String(t._id)}
                    transaction={t}
                    isLast={idx === group.length - 1}
                  />
                ))}
              </div>
            );
          })
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
  const [detailOpen, setDetailOpen] = useState(false);
  const isIncome = t.type === "income";
  const catColor = t.categoryId?.color || "#64748b";

  const handleDelete = () => {
    deleteTransaction.mutate({ id: String(t._id), date: t.date });
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer",
          !isLast && "border-b border-border/60",
        )}
      >
        {/* Category avatar */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold"
          style={{ backgroundColor: `${catColor}18`, color: catColor }}
        >
          {t.categoryId?.name?.[0]?.toUpperCase() ?? "?"}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium text-foreground">
              {t.categoryId?.name || "Uncategorized"}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                isIncome
                  ? "bg-(--income)/10 text-(--income)"
                  : "bg-(--expense)/10 text-(--expense)",
              )}
            >
              {isIncome ? "Income" : "Expense"}
            </span>
          </div>
          {t.note ? (
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {t.note}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 mt-0.5">
              {format(new Date(t.date), "MMM d, yyyy")}
            </p>
          )}
        </div>

        {/* Amount */}
        <span
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            isIncome ? "text-(--income)" : "text-(--expense)",
          )}
        >
          {isIncome ? "+" : "−"}৳{t.amount.toLocaleString()}
        </span>

        {/* Actions */}
        <div
          className="flex shrink-0 items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit transaction"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete transaction"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      <TransactionDetailModal
        transaction={t}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => {
          setDetailOpen(false);
          setEditOpen(true);
        }}
        onDelete={() => {
          setDetailOpen(false);
          setDeleteOpen(true);
        }}
      />

      <EditTransactionDialog
        transaction={t}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

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

function TransactionDetailModal({
  transaction: t,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  transaction: TransactionWithCategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = t.type === "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[360px] overflow-hidden w-[calc(100%-2rem)]">
        {/* Hero */}
        <div
          className={cn(
            "relative flex flex-col items-center pt-8 pb-6 px-6 m-2 rounded-2xl",
            isIncome ? "bg-(--income)/10" : "bg-(--expense)/10",
          )}
        >
          {/* Amount */}
          <p
            className={cn(
              "text-3xl font-bold tabular-nums tracking-tight",
              isIncome ? "text-(--income)" : "text-(--expense)"
            )}
          >
            {isIncome ? "+" : "−"}৳{t.amount.toLocaleString()}
          </p>

          {/* Type badge */}
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              isIncome
                ? "bg-(--income)/15 text-(--income)"
                : "bg-(--expense)/15 text-(--expense)"
            )}
          >
            {isIncome ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownLeft className="h-3 w-3" />
            )}
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>

        {/* Details */}
        <div className="px-5 pb-2 space-y-1">
          <DetailRow
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Category"
            value={t.categoryId?.name || "Uncategorized"}
            valueClassName={isIncome ? "text-(--income)" : "text-(--expense)"}
          />
          <DetailRow
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Date"
            value={format(new Date(t.date), "EEEE, MMMM d, yyyy")}
          />
          {t.note && (
            <DetailRow
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Note"
              value={t.note}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 pt-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl gap-2 text-sm"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl gap-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 bg-muted/40">
      <span className="text-muted-foreground shrink-0 mt-0.5">{icon}</span>
      <span className="text-xs text-muted-foreground w-16 shrink-0 mt-0.5">
        {label}
      </span>
      <span className={cn("text-xs font-medium min-w-0 wrap-break-word", valueClassName ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );
}
