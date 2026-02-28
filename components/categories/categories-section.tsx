"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <CategoryChip key={String(cat._id)} category={cat} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
