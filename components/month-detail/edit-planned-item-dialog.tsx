"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import type { PlannedItemWithCategory } from "@/hooks/usePlannedItems";

interface EditPlannedItemDialogProps {
  item: PlannedItemWithCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, body: { title: string; type: "income" | "expense"; amount: number; categoryId: string; note?: string }) => Promise<unknown>;
  isPending: boolean;
}

export default function EditPlannedItemDialog({
  item,
  open,
  onOpenChange,
  onUpdate,
  isPending,
}: EditPlannedItemDialogProps) {
  const { categories } = useCategories();
  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState<"income" | "expense">(item.type as "income" | "expense");
  const [amount, setAmount] = useState(String(item.amount));
  const [categoryId, setCategoryId] = useState(String(item.categoryId?._id ?? item.categoryId));
  const [note, setNote] = useState(item.note ?? "");

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !amount) return;
    await onUpdate(String(item._id), {
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      categoryId,
      note: note.trim() || undefined,
    });
    onOpenChange(false);
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 sm:max-w-[420px]">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base font-semibold">Edit planned item</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Update title, amount, category or note.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Salary, Electricity"
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(""); }}
                className="h-10 rounded-xl border text-sm font-semibold transition-colors capitalize"
                style={{
                  backgroundColor: type === t ? (t === "income" ? "var(--income)" : "var(--expense)") : "transparent",
                  borderColor: type === t ? (t === "income" ? "var(--income)" : "var(--expense)") : "var(--border)",
                  color: type === t ? "white" : "var(--muted-foreground)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Amount (৳)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {filteredCategories.map((cat) => (
                  <SelectItem key={String(cat._id)} value={String(cat._id)}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Note <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Due on 5th"
              className="h-10 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl font-medium text-sm"
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
