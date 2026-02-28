"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import EditCategoryDialog from "./edit-category-dialog";
import type { ICategory } from "@/models/Category";
import { Trash2, Loader2 } from "lucide-react";

interface CategoryChipProps {
  category: ICategory;
}

export default function CategoryChip({ category: cat }: CategoryChipProps) {
  const { deleteCategory } = useCategories();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const id = String(cat._id);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteCategory.mutate(id);
    setConfirmDelete(false);
  };

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40">
      {/* Color swatch */}
      <span
        className="h-3 w-3 rounded-full shrink-0"
        style={{ backgroundColor: cat.color }}
      />

      {/* Name */}
      <span className="flex-1 text-sm font-medium text-foreground truncate">{cat.name}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditCategoryDialog category={cat} />

        {confirmDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            aria-label="Confirm delete"
            className="flex h-7 items-center gap-1 rounded-lg bg-destructive/10 px-2 text-[11px] font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white"
          >
            {deleteCategory.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Confirm?"
            )}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            aria-label="Delete category"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
