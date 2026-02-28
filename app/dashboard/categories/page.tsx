"use client";

import Header from "@/components/Dashboard/Header";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryIcon } from "@/lib/category-icons";
import type { ICategory } from "@/models/Category";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import CreateCategoryDialog from "@/components/Dashboard/CreateCategoryDialog";

function CategoryChip({ cat }: { cat: ICategory }) {
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

function Section({
  title,
  icon: Icon,
  categories,
  isLoading,
  emptyMessage,
}: {
  title: string;
  icon: React.ElementType;
  categories: ICategory[];
  isLoading: boolean;
  emptyMessage: string;
}) {
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
              <CategoryChip key={String(cat._id)} cat={cat} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const { categories, isLoading, error } = useCategories();

  const incomeCategories = (categories ?? []).filter(
    (c) => c.type === "income",
  );
  const expenseCategories = (categories ?? []).filter(
    (c) => c.type === "expense",
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Income and expense categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateCategoryDialog />
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Failed to load categories. Please try again.
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <Section
            title="Income"
            icon={ArrowDownCircle}
            categories={incomeCategories}
            isLoading={isLoading}
            emptyMessage="No income categories yet. Create one to track income sources."
          />
          <Section
            title="Expense"
            icon={ArrowUpCircle}
            categories={expenseCategories}
            isLoading={isLoading}
            emptyMessage="No expense categories yet. Create one to track spending."
          />
        </div>
      </main>
    </div>
  );
}
