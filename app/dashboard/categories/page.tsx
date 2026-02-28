"use client";

import Header from "../_components/header";
import CreateCategoryDialog from "../_components/create-category-dialog";
import { useCategories } from "@/hooks/useCategories";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
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
          <CategoriesSection
            title="Income"
            icon={ArrowDownCircle}
            categories={incomeCategories}
            isLoading={isLoading}
            emptyMessage="No income categories yet. Create one to track income sources."
          />
          <CategoriesSection
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
