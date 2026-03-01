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
import type { ICategory } from "@/models/Category";

const TYPE_DEFAULT_COLOR: Record<"income" | "expense", string> = {
  income: "#22c55e",
  expense: "#ef4444",
};

interface CategoryDialogProps {
  /** Provide to enter edit mode (controlled, no trigger rendered) */
  category?: ICategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Only used in create mode */
  triggerClassName?: string;
}

export default function CreateCategoryDialog({
  category,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerClassName,
}: CategoryDialogProps = {}) {
  const isEditMode = !!category;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEditMode ? (controlledOpen ?? false) : internalOpen;
  const setOpen = isEditMode
    ? (controlledOnOpenChange ?? (() => {}))
    : setInternalOpen;

  if (isEditMode) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 sm:max-w-[400px]">
          {/* key forces remount → fresh state — each time dialog opens */}
          <CategoryForm
            key={open ? `edit-${String(category._id)}` : "edit-closed"}
            category={category}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
      }}
    >
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
        <CategoryForm
          key={open ? "create-open" : "create-closed"}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Inner form — initialised once on mount via state initialisers (no useEffect)
// ---------------------------------------------------------------------------
function CategoryForm({
  category,
  onClose,
}: {
  category?: ICategory;
  onClose: () => void;
}) {
  const isEditMode = !!category;
  const { createCategory, updateCategory } = useCategories();

  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<"income" | "expense">(
    (category?.type as "income" | "expense") ?? "expense",
  );
  const [color, setColor] = useState(
    category?.color ?? TYPE_DEFAULT_COLOR["expense"],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (isEditMode && category) {
        await updateCategory.mutateAsync({
          id: String(category._id),
          name: name.trim(),
          type,
          color,
        });
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          type,
          color,
          icon: "Circle",
        });
      }
      onClose();
    } catch {
      // handled by mutation
    }
  };

  const isPending = isEditMode
    ? updateCategory.isPending
    : createCategory.isPending;

  return (
    <>
      <DialogHeader className="px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl shrink-0 transition-colors duration-200"
            style={{ backgroundColor: color }}
          />
          <DialogTitle className="text-base font-semibold">
            {isEditMode ? "Edit category" : "New category"}
          </DialogTitle>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="cat-name"
            className="text-xs font-medium text-muted-foreground"
          >
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
          <Label className="text-xs font-medium text-muted-foreground">
            Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "h-10 rounded-xl border text-sm font-semibold transition-all duration-150 capitalize",
                  type === t
                    ? "text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:border-border/80",
                )}
                style={
                  type === t
                    ? {
                        backgroundColor: TYPE_DEFAULT_COLOR[t],
                        borderColor: TYPE_DEFAULT_COLOR[t],
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "var(--border)",
                      }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Color
            </Label>
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {color}
            </span>
          </div>
          <div className="rounded-xl border bg-muted/30 p-2.5">
            <div className="grid grid-cols-8 gap-5">
              {CATEGORY_COLORS.map((c) => {
                const selected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Color ${c}`}
                    className={cn(
                      "relative h-6 w-6 rounded-full transition-all cursor-pointer duration-150",
                      "hover:scale-110 focus-visible:outline-none",
                      selected
                        ? "scale-110 ring-2 ring-offset-1 ring-offset-background"
                        : "hover:ring-1 hover:ring-offset-1 hover:ring-offset-background",
                    )}
                    style={{
                      backgroundColor: c,
                      "--tw-ring-color": c,
                    } as React.CSSProperties}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check
                          className="h-3 w-3 text-white drop-shadow"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="h-10 w-full rounded-xl font-medium text-sm"
          disabled={isPending}
        >
          {isPending
            ? isEditMode
              ? "Saving…"
              : "Creating…"
            : isEditMode
              ? "Save changes"
              : "Create category"}
        </Button>
      </form>
    </>
  );
}
