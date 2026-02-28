"use client";

import { Button } from "@/components/ui/button";
import { PlannedItemWithCategory } from "@/hooks/usePlannedItems";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Check,
  Undo2,
  Trash2,
  ListTodo,
  Loader2,
} from "lucide-react";
import AddPlannedItemDialog from "./add-planned-item-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface PlannedListSectionProps {
  year: number;
  month: number;
  items: PlannedItemWithCategory[];
  isLoading: boolean;
  onCreate: (body: {
    year: number;
    month: number;
    title: string;
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    note?: string;
  }) => Promise<unknown>;
  createPending: boolean;
  onMarkDone: (id: string) => void;
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
  markDonePendingId: string | null;
  undoPendingId: string | null;
}

export default function PlannedListSection({
  year,
  month,
  items,
  isLoading,
  onCreate,
  createPending,
  onMarkDone,
  onUndo,
  onDelete,
  markDonePendingId,
  undoPendingId,
}: PlannedListSectionProps) {
  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status === "done");

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <ListTodo className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">Month checklist</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {items.length === 0
                ? "Plan income & expenses"
                : `${pending.length} pending · ${done.length} done`}
            </p>
          </div>
        </div>
        <AddPlannedItemDialog
          year={year}
          month={month}
          onCreate={onCreate}
          isPending={createPending}
        />
      </div>

      {/* Body */}
      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[52px] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-9 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <ListTodo className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">Nothing planned yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
              Add salary, bills or subscriptions to track this month
            </p>
            <div className="mt-4">
              <AddPlannedItemDialog
                year={year}
                month={month}
                onCreate={onCreate}
                isPending={createPending}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {pending.length > 0 && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Pending · {pending.length}
                  </p>
                  <ul className="space-y-1.5">
                    {pending.map((item) => (
                      <PlannedItemRow
                        key={String(item._id)}
                        item={item}
                        onMarkDone={onMarkDone}
                        onDelete={onDelete}
                        isMarkDonePending={markDonePendingId === String(item._id)}
                      />
                    ))}
                  </ul>
                </motion.div>
              )}

              {done.length > 0 && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Completed · {done.length}
                  </p>
                  <ul className="space-y-1.5">
                    {done.map((item) => (
                      <PlannedItemRow
                        key={String(item._id)}
                        item={item}
                        isDone
                        onUndo={onUndo}
                        onDelete={onDelete}
                        isUndoPending={undoPendingId === String(item._id)}
                      />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function PlannedItemRow({
  item,
  isDone,
  onMarkDone,
  onUndo,
  onDelete,
  isMarkDonePending,
  isUndoPending,
}: {
  item: PlannedItemWithCategory;
  isDone?: boolean;
  onMarkDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkDonePending?: boolean;
  isUndoPending?: boolean;
}) {
  const cat = item.categoryId as { name?: string; color?: string };
  const id = String(item._id);
  const isIncome = item.type === "income";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5",
        isDone && "opacity-60"
      )}
    >
      {/* Category dot */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
        style={{ backgroundColor: cat?.color || "var(--muted-foreground)" }}
      >
        {cat?.name?.[0]?.toUpperCase() ?? "?"}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[13px] font-medium leading-tight text-foreground",
            isDone && "line-through text-muted-foreground"
          )}
        >
          {item.title}
        </p>
        <p className="truncate text-[11px] text-muted-foreground leading-tight">
          {cat?.name ?? "Uncategorized"}
          {item.note ? ` · ${item.note}` : ""}
        </p>
      </div>

      {/* Amount */}
      <span
        className={cn(
          "shrink-0 text-[13px] font-semibold tabular-nums",
          isIncome ? "text-[var(--income)]" : "text-[var(--expense)]"
        )}
      >
        {isIncome ? "+" : "−"}৳{item.amount.toLocaleString()}
      </span>

      {/* Actions — always visible */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Trash — always visible */}
        <button
          onClick={() => onDelete(id)}
          aria-label="Delete"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        {isDone ? (
          /* Undo button */
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-lg px-2 text-[11px] text-muted-foreground hover:text-foreground"
            onClick={() => onUndo?.(id)}
            disabled={isUndoPending}
          >
            {isUndoPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Undo2 className="h-3 w-3" />
            )}
            Undo
          </Button>
        ) : (
          /* Mark done button */
          <Button
            size="sm"
            className="h-7 gap-1 rounded-lg px-2.5 text-[11px] font-semibold"
            onClick={() => onMarkDone?.(id)}
            disabled={isMarkDonePending}
          >
            {isMarkDonePending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Done
          </Button>
        )}
      </div>

      {/* Done badge overlaid on right edge */}
      {isDone && (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
      )}
    </motion.li>
  );
}
