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
import { DatePickerInputString, toDateString } from "@/components/ui/date-picker-input";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions, TransactionWithCategory } from "@/hooks/useTransactions";
import { Pencil } from "lucide-react";

interface EditTransactionDialogProps {
  transaction: TransactionWithCategory;
}

export default function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();
  const { updateTransaction } = useTransactions({});

  const [amount, setAmount] = useState(String(transaction.amount));
  const [type, setType] = useState<"income" | "expense">(transaction.type as "income" | "expense");
  const [categoryId, setCategoryId] = useState(String(transaction.categoryId?._id ?? ""));
  const [note, setNote] = useState(transaction.note ?? "");
  const [date, setDate] = useState(toDateString(new Date(transaction.date)));

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setAmount(String(transaction.amount));
      setType(transaction.type as "income" | "expense");
      setCategoryId(String(transaction.categoryId?._id ?? ""));
      setNote(transaction.note ?? "");
      setDate(toDateString(new Date(transaction.date)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) return;
    await updateTransaction.mutateAsync({
      id: String(transaction._id),
      amount: parseFloat(amount),
      type,
      categoryId: categoryId as unknown as Parameters<typeof updateTransaction.mutateAsync>[0]["categoryId"],
      note,
      date: new Date(date),
    });
    setOpen(false);
  };

  const filteredCategories = categories?.filter((c) => c.type === type) ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          aria-label="Edit transaction"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 sm:max-w-[420px]">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base font-semibold">Edit transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(""); }}
                className="h-10 rounded-xl border text-sm font-semibold transition-colors capitalize"
                style={{
                  backgroundColor: type === t
                    ? t === "income" ? "var(--income)" : "var(--expense)"
                    : "transparent",
                  borderColor: type === t
                    ? t === "income" ? "var(--income)" : "var(--expense)"
                    : "var(--border)",
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
            <Label className="text-xs font-medium text-muted-foreground">Date</Label>
            <DatePickerInputString key={date} value={date} onChange={setDate} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Note <span className="text-muted-foreground/50">(optional)</span>
            </Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Weekly groceries"
              className="h-10 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl font-medium text-sm"
            disabled={updateTransaction.isPending}
          >
            {updateTransaction.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
