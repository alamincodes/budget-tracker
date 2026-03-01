"use client";

import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import CreateCategoryDialog from "@/app/dashboard/_components/create-category-dialog";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { ICategory } from "@/models/Category";
import { Trash2, Pencil, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryChipProps {
  category: ICategory;
}

export default function CategoryChip({ category: cat }: CategoryChipProps) {
  const { deleteCategory } = useCategories();
  const [manageOpen, setManageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const id = String(cat._id);

  const handleDelete = () => {
    deleteCategory.mutate(id);
    setDeleteOpen(false);
  };

  return (
    <>
      {/* Chip row — click opens manage modal */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setManageOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setManageOpen(true)}
        className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-colors hover:bg-muted/40 cursor-pointer"
      >
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: cat.color }}
        />
        <span className="flex-1 text-sm font-medium text-foreground truncate">
          {cat.name}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
      </div>

      {/* Manage modal */}
      <CategoryManageModal
        category={cat}
        open={manageOpen}
        onOpenChange={setManageOpen}
        onEdit={() => {
          setManageOpen(false);
          setEditOpen(true);
        }}
        onDelete={() => {
          setManageOpen(false);
          setDeleteOpen(true);
        }}
      />

      {/* Edit dialog */}
      <CreateCategoryDialog
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

function CategoryManageModal({
  category: cat,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  category: ICategory;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = cat.type === "income";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[340px] overflow-hidden w-[calc(100%-2rem)]">
        {/* Hero */}
        <div
          className="relative flex flex-col items-center pt-8 pb-6 px-6 m-2 rounded-2xl"
          style={{ backgroundColor: `${cat.color}18` }}
        >
          {/* Color circle */}
          <div
            className="h-14 w-14 rounded-2xl mb-3 shadow-sm"
            style={{ backgroundColor: cat.color }}
          />

          {/* Name */}
          <p className="text-lg font-bold text-foreground tracking-tight">
            {cat.name}
          </p>

          {/* Type badge */}
          <span
            className={cn(
              "mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
            )}
            style={{
              backgroundColor: `${cat.color}25`,
              color: cat.color,
            }}
          >
            {isIncome ? "Income" : "Expense"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5 pt-2">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl gap-2 text-sm"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl gap-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
