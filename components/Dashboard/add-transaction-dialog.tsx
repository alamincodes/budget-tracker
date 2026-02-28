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
import { useTransactions } from "@/hooks/useTransactions";
import { DatePickerInputString, toDateString } from "@/components/ui/date-picker-input";
import { Plus } from "lucide-react";

export interface AddTransactionDialogProps {
  /** When on month detail page: pre-fill date with this month (first day) */
  defaultYear?: number;
  defaultMonth?: number;
}

export default function AddTransactionDialog({
  defaultYear,
  defaultMonth,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();
  const { createTransaction } = useTransactions({});

  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(toDateString(new Date()));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      if (defaultYear != null && defaultMonth != null) {
        setDate(toDateString(new Date(defaultYear, defaultMonth - 1, 1)));
      } else {
        setDate(toDateString(new Date()));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) return;

    await createTransaction.mutateAsync({
      amount: parseFloat(amount),
      type,
      categoryId: categoryId as unknown as Parameters<typeof createTransaction.mutateAsync>[0]["categoryId"],
      note,
      date: new Date(date),
    });

    setOpen(false);
    setAmount("");
    setNote("");
    setCategoryId("");
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl gap-2 font-medium shadow-sm">
          <Plus className="h-4 w-4" />
          Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border bg-card p-0 shadow-xl sm:max-w-[420px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">Add transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
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
              <Label>Amount</Label>
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
            <Label>Date</Label>
            <DatePickerInputString key={date} value={date} onChange={setDate} />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Groceries"
              className="h-11 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl font-medium"
            disabled={createTransaction.isPending}
          >
            {createTransaction.isPending ? "Adding…" : "Add transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
