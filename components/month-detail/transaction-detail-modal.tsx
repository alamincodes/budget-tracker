"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  CalendarDays,
  Tag,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import type { TransactionWithCategory } from "@/hooks/useTransactions";

interface TransactionDetailModalProps {
  transaction: TransactionWithCategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionDetailModal({
  transaction: t,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
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
              isIncome ? "text-(--income)" : "text-(--expense)",
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
                : "bg-(--expense)/15 text-(--expense)",
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
      <span
        className={cn(
          "text-xs font-medium min-w-0 wrap-break-word",
          valueClassName ?? "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
