"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddPlannedItemDialogProps {
  year: number;
  month: number;
  onCreate: (body: {
    year: number;
    month: number;
    title: string;
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    note?: string;
  }) => Promise<unknown>;
  isPending: boolean;
  triggerClassName?: string;
}

export default function AddPlannedItemDialog({
  year,
  month,
  onCreate,
  isPending,
  triggerClassName,
}: AddPlannedItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTitle("");
      setAmount("");
      setCategoryId("");
      setNote("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !amount) return;

    await onCreate({
      year,
      month,
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      categoryId,
      note: note.trim() || undefined,
    });

    setOpen(false);
    setTitle("");
    setAmount("");
    setCategoryId("");
    setNote("");
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl gap-2 border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50",
            triggerClassName
          )}
        >
          <ListPlus className="h-4 w-4" />
          Add to list
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border bg-card p-0 shadow-xl sm:max-w-[420px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">Add to month list</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Bills, salary, subscriptions — track what you expect this month.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Salary, Electricity, Netflix"
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (৳)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {filteredCategories.map((cat) => (
                  <SelectItem key={String(cat._id)} value={String(cat._id)}>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Due on 5th"
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl font-medium"
            disabled={isPending}
          >
            {isPending ? "Adding…" : "Add to list"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
