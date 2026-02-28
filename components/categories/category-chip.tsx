"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import EditCategoryDialog from "./edit-category-dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { ICategory } from "@/models/Category";
import { Trash2, Pencil } from "lucide-react";

interface CategoryChipProps {
  category: ICategory;
}

export default function CategoryChip({ category: cat }: CategoryChipProps) {
  const { deleteCategory } = useCategories();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const id = String(cat._id);

  const handleDelete = () => {
    deleteCategory.mutate(id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40">
        {/* Color dot */}
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: cat.color }}
        />

        {/* Name */}
        <span className="flex-1 text-sm font-medium text-foreground truncate">{cat.name}</span>

        {/* Actions — always visible */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditOpen(true)}
            aria-label="Edit category"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete category"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit dialog */}
      <EditCategoryDialog
        category={cat}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete confirm modal */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isPending={deleteCategory.isPending}
        title="Delete category?"
        description={`"${cat.name}" will be permanently deleted. Existing transactions won't be affected.`}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
