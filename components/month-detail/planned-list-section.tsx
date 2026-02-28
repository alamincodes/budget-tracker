"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlannedItemWithCategory } from "@/hooks/usePlannedItems";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Undo2,
  Trash2,
  ListTodo,
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
    <Card className="overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">
                This month&apos;s list
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Plan income & expenses — mark done when they hit
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
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-2 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-12 text-center">
            <ListTodo className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No items yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add salary, bills, subscriptions to track this month
            </p>
            <AddPlannedItemDialog
              year={year}
              month={month}
              onCreate={onCreate}
              isPending={createPending}
              triggerClassName="mt-4"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pending.length > 0 && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pending
                  </p>
                  <ul className="space-y-2">
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Done
                  </p>
                  <ul className="space-y-2">
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
      </CardContent>
    </Card>
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

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-colors",
        isDone && "border-primary/20 bg-primary/5 opacity-90"
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ backgroundColor: cat?.color || "var(--muted-foreground)" }}
      >
        {cat?.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium",
            isDone && "text-muted-foreground line-through"
          )}
        >
          {item.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {cat?.name ?? "Uncategorized"}
          {item.note ? ` · ${item.note}` : ""}
        </p>
      </div>
      <div
        className={cn(
          "shrink-0 text-right font-semibold tabular-nums",
          item.type === "income" ? "text-[var(--income)]" : "text-[var(--expense)]"
        )}
      >
        {item.type === "income" ? "+" : "−"}৳{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {isDone ? (
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => onUndo?.(id)}
              disabled={isUndoPending}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Done
            </span>
          </>
        ) : (
          <div className="relative flex items-center overflow-hidden pl-9">
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-full rounded-lg text-muted-foreground transition-transform duration-200 group-hover:translate-x-0 hover:text-destructive"
              onClick={() => onDelete(id)}
              aria-label="Remove from list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-lg gap-1.5 font-medium shrink-0 transition-transform duration-200 group-hover:-translate-x-9"
              onClick={() => onMarkDone?.(id)}
              disabled={isMarkDonePending}
            >
              <Circle className="h-4 w-4" />
              Mark done
            </Button>
          </div>
        )}
      </div>
    </motion.li>
  );
}
