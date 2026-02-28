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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";

function toDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DatePickerInput({ value, onChange }: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const dateFromValue = value ? new Date(value) : undefined;
  const [date, setDate] = useState<Date | undefined>(() => dateFromValue);
  const [month, setMonth] = useState<Date | undefined>(() => dateFromValue ?? new Date());
  const [display, setDisplay] = useState(() => formatDisplayDate(dateFromValue));

  const dateToShow = date ?? dateFromValue;
  const displayToShow = display || formatDisplayDate(dateFromValue);

  return (
    <div className="flex rounded-xl border border-input bg-transparent shadow-xs overflow-hidden focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      <Input
        value={displayToShow}
        placeholder="June 01, 2025"
        onChange={(e) => {
          const v = e.target.value;
          setDisplay(v);
          const d = new Date(v);
          if (isValidDate(d)) {
            setDate(d);
            setMonth(d);
            onChange(toDateString(d));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="h-11 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-11 w-11 shrink-0 rounded-none border-l border-input"
            aria-label="Select date"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border bg-popover p-0 shadow-lg"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={dateToShow}
            month={month}
            onMonthChange={setMonth}
            onSelect={(next) => {
              setDate(next);
              if (next) {
                setMonth(next);
                setDisplay(formatDisplayDate(next));
                onChange(toDateString(next));
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

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
            <DatePickerInput key={date} value={date} onChange={setDate} />
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
