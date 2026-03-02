"use client";

import { useState } from "react";
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
  Pencil,
  ArrowDownLeft,
  ArrowUpRight,
  Tag,
  FileText,
} from "lucide-react";
import AddPlannedItemDialog from "./add-planned-item-dialog";
import EditPlannedItemDialog from "./edit-planned-item-dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  onUpdate: (id: string, body: { title: string; type: "income" | "expense"; amount: number; categoryId: string; note?: string }) => Promise<unknown>;
  updatePending: boolean;
  onMarkDone: (id: string) => void;
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
  deletePending?: boolean;
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
  onUpdate,
  updatePending,
  onMarkDone,
  onUndo,
  onDelete,
  deletePending = false,
  markDonePendingId,
  undoPendingId,
}: PlannedListSectionProps) {
  const [editingItem, setEditingItem] = useState<PlannedItemWithCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const pending = items.filter((i) => i.status === "pending");
  const done = items.filter((i) => i.status === "done");

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

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
                        onEdit={setEditingItem}
                        onMarkDone={onMarkDone}
                        onRequestDelete={setDeleteConfirmId}
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
                        onEdit={setEditingItem}
                        onUndo={onUndo}
                        onRequestDelete={setDeleteConfirmId}
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

      {editingItem && (
        <EditPlannedItemDialog
          key={String(editingItem._id)}
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onUpdate={onUpdate}
          isPending={updatePending}
        />
      )}

      <ConfirmModal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deletePending}
        title="Remove from list?"
        description="This planned item will be deleted. You can add it again anytime."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}

function PlannedItemRow({
  item,
  isDone,
  onEdit,
  onMarkDone,
  onUndo,
  onRequestDelete,
  isMarkDonePending,
  isUndoPending,
}: {
  item: PlannedItemWithCategory;
  isDone?: boolean;
  onEdit?: (item: PlannedItemWithCategory) => void;
  onMarkDone?: (id: string) => void;
  onUndo?: (id: string) => void;
  onRequestDelete?: (id: string) => void;
  isMarkDonePending?: boolean;
  isUndoPending?: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const cat = item.categoryId as { name?: string; color?: string };
  const id = String(item._id);
  const isIncome = item.type === "income";

  return (
    <>
      <motion.li
        layout
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.15 }}
        role="button"
        tabIndex={0}
        onClick={() => setDetailOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setDetailOpen(true)}
        className={cn(
          "flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/40",
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
          isIncome ? "text-(--income)" : "text-(--expense)"
        )}
      >
        {isIncome ? "+" : "−"}৳{item.amount.toLocaleString()}
      </span>

      {/* Actions — always visible */}
      <div
        className="flex shrink-0 items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            aria-label="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {onRequestDelete && (
          <button
            onClick={() => onRequestDelete(id)}
            aria-label="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

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

      <PlannedItemDetailModal
        item={item}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => {
          setDetailOpen(false);
          onEdit?.(item);
        }}
        onDelete={() => {
          setDetailOpen(false);
          onRequestDelete?.(id);
        }}
      />
    </>
  );
}

function PlannedItemDetailModal({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  item: PlannedItemWithCategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = item.type === "income";
  const cat = item.categoryId as { name?: string; color?: string };

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
          <p
            className={cn(
              "text-3xl font-bold tabular-nums tracking-tight",
              isIncome ? "text-(--income)" : "text-(--expense)",
            )}
          >
            {isIncome ? "+" : "−"}৳{item.amount.toLocaleString()}
          </p>
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
          <PlannedDetailRow
            icon={<FileText className="h-3.5 w-3.5" />}
            label="Title"
            value={item.title}
          />
          <PlannedDetailRow
            icon={<Tag className="h-3.5 w-3.5" />}
            label="Category"
            value={cat?.name ?? "Uncategorized"}
            valueClassName={isIncome ? "text-(--income)" : "text-(--expense)"}
          />
          {item.note && (
            <PlannedDetailRow
              icon={<FileText className="h-3.5 w-3.5" />}
              label="Note"
              value={item.note}
            />
          )}
          <PlannedDetailRow
            icon={item.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ListTodo className="h-3.5 w-3.5" />}
            label="Status"
            value={item.status === "done" ? "Completed" : "Pending"}
          />
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

function PlannedDetailRow({
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
