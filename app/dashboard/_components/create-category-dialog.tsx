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
import { useCategories } from "@/hooks/useCategories";
import { CATEGORY_COLORS } from "@/lib/category-options";
import { Check, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_DEFAULT_COLOR: Record<"income" | "expense", string> = {
  income: "#22c55e",
  expense: "#ef4444",
};

export default function CreateCategoryDialog({ triggerClassName }: { triggerClassName?: string } = {}) {
  const [open, setOpen] = useState(false);
  const { createCategory } = useCategories();
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(TYPE_DEFAULT_COLOR["expense"]);

  const reset = () => {
    setName("");
    setType("expense");
    setColor(TYPE_DEFAULT_COLOR["expense"]);
  };

  const handleTypeChange = (t: "income" | "expense") => {
    setType(t);
    setColor(TYPE_DEFAULT_COLOR[t]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory.mutateAsync({ name: name.trim(), type, color, icon: "Circle" });
      setOpen(false);
      reset();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-10 rounded-xl gap-2 text-sm${triggerClassName ? ` ${triggerClassName}` : ""}`}
        >
          <FolderPlus className="h-4 w-4" />
          New category
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 sm:max-w-[400px]">
        <DialogHeader className="px-5 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl shrink-0 transition-colors duration-200"
              style={{ backgroundColor: color }}
            />
            <DialogTitle className="text-base font-semibold">New category</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name" className="text-xs font-medium text-muted-foreground">
              Name
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              className="h-10 rounded-xl"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "h-10 rounded-xl border text-sm font-semibold transition-all duration-150 capitalize",
                    type === t
                      ? "text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:border-border/80"
                  )}
                  style={
                    type === t
                      ? { backgroundColor: color, borderColor: color }
                      : { backgroundColor: "transparent", borderColor: "var(--border)" }
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color — modern circle picker */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Color</Label>
            <div className="grid grid-cols-5 gap-2.5">
              {CATEGORY_COLORS.map((c) => {
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    className={cn(
                      "relative h-10 w-full rounded-full transition-all duration-150",
                      "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      selected && "scale-110 ring-2 ring-offset-2"
                    )}
                    style={{
                      backgroundColor: c,
                      ...(selected ? { ringColor: c } : {}),
                    }}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white drop-shadow" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl font-medium text-sm"
            disabled={createCategory.isPending}
          >
            {createCategory.isPending ? "Creating…" : "Create category"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
