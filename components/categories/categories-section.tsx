"use client";

import { Skeleton } from "@/components/ui/skeleton";
import CategoryChip from "./category-chip";
import type { ICategory } from "@/models/Category";

interface CategoriesSectionProps {
  title: string;
  icon: React.ElementType;
  categories: ICategory[];
  isLoading: boolean;
  emptyMessage: string;
}

export default function CategoriesSection({
  title,
  icon: Icon,
  categories,
  isLoading,
  emptyMessage,
}: CategoriesSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{categories.length}</span>
      </div>
      <div className="p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="px-1 py-4 text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <CategoryChip key={String(cat._id)} category={cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
