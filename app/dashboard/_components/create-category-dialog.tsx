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
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/category-options";
import { FolderPlus } from "lucide-react";

export default function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const { createCategory } = useCategories();
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(CATEGORY_COLORS[2]);
  const [icon, setIcon] = useState("ShoppingCart");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({
        name: name.trim(),
        type,
        color,
        icon,
      });
      setOpen(false);
      setName("");
      setType("expense");
      setColor(CATEGORY_COLORS[2]);
      setIcon("ShoppingCart");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 rounded-xl gap-2 shadow-sm">
          <FolderPlus className="h-4 w-4" />
          New category
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border bg-card p-0 shadow-xl sm:max-w-[400px]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">Create category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              className="h-11 rounded-xl"
              required
            />
          </div>
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
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-8 w-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--ring)" : "transparent",
                  }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Pick icon" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CATEGORY_ICONS.map(({ value: v, label }) => (
                  <SelectItem key={v} value={v}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl font-medium"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? "Creating…" : "Create category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
