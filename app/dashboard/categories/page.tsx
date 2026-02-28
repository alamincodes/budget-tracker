"use client";

import CreateCategoryDialog from "../_components/create-category-dialog";
import { useCategories } from "@/hooks/useCategories";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import CategoriesSection from "../../../components/categories/categories-section";

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
      <main className="flex-1 container mx-auto px-4 pt-6 pb-24 sm:pb-10 max-w-6xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Categories
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage income & expense categories
            </p>
          </div>
          <CreateCategoryDialog />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Failed to load categories. Please try again.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <CategoriesSection
            title="Income"
            icon={ArrowDownCircle}
            categories={incomeCategories}
            isLoading={isLoading}
            emptyMessage="No income categories yet."
          />
          <CategoriesSection
            title="Expense"
            icon={ArrowUpCircle}
            categories={expenseCategories}
            isLoading={isLoading}
            emptyMessage="No expense categories yet."
          />
        </div>
      </main>
    </div>
  );
}
