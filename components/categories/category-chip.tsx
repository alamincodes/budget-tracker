"use client";

import { getCategoryIcon } from "@/lib/category-icons";
import type { ICategory } from "@/models/Category";

interface CategoryChipProps {
  category: ICategory;
}

export default function CategoryChip({ category: cat }: CategoryChipProps) {
  const Icon = getCategoryIcon(cat.icon);
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/50"
      style={{ borderLeftWidth: 4, borderLeftColor: cat.color }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: cat.color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium text-foreground">{cat.name}</span>
    </div>
  );
}
