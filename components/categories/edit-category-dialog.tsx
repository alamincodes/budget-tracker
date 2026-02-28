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
import { useCategories } from "@/hooks/useCategories";
import { CATEGORY_COLORS } from "@/lib/category-options";
import type { ICategory } from "@/models/Category";

interface EditCategoryDialogProps {
  category: ICategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const { updateCategory } = useCategories();

  const [name, setName] = useState(category.name);
  const [type, setType] = useState<"income" | "expense">(category.type as "income" | "expense");
  const [color, setColor] = useState(category.color);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (next) {
      setName(category.name);
      setType(category.type as "income" | "expense");
      setColor(category.color);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateCategory.mutateAsync({
        id: String(category._id),
        name: name.trim(),
        type,
        color,
      });
      onOpenChange(false);
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-[400px]">
        <DialogHeader className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl shrink-0"
              style={{ backgroundColor: color }}
            />
            <DialogTitle className="text-base font-semibold">Edit category</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
          <div className="space-y-1.5">
            <Label htmlFor="edit-cat-name" className="text-xs font-medium text-muted-foreground">Name</Label>
            <Input
              id="edit-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="h-10 rounded-xl border text-sm font-semibold transition-colors capitalize"
                  style={{
                    backgroundColor: type === t ? color : "transparent",
                    borderColor: type === t ? color : "var(--border)",
                    color: type === t ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="h-10 rounded-xl transition-all hover:scale-105 focus:outline-none relative"
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                >
                  {color === c && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl font-medium text-sm"
            disabled={updateCategory.isPending}
          >
            {updateCategory.isPending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
