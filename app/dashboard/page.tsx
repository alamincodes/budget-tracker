"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import StatsCards from "@/components/Dashboard/StatsCards";
import YearOverview from "@/components/Dashboard/YearOverview";
import Header from "@/components/Dashboard/Header";
import AddTransactionDialog from "@/components/Dashboard/AddTransactionDialog";
import { DateFilterPicker } from "@/components/Dashboard/DateFilterPicker";
import CreateCategoryDialog from "@/components/Dashboard/CreateCategoryDialog";
import {
  getDefaultDateFilterState,
  getDateRangeFromFilter,
  type DateFilterState,
} from "@/types/filters";

const currentYear = () => new Date().getFullYear();

export default function DashboardPage() {
  const [filterState, setFilterState] = useState<DateFilterState>(
    getDefaultDateFilterState()
  );
  const range = useMemo(() => getDateRangeFromFilter(filterState), [filterState]);
  const filters = useMemo(
    () => (range ? { from: range.from, to: range.to } : {}),
    [range]
  );
  const displayYear =
    filterState.preset === 'specific_year' && filterState.specificYear != null
      ? filterState.specificYear
      : currentYear();
  const { summary, yearOverview, isLoading } = useDashboard({ filters, year: displayYear });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Overview of your finances
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateFilterPicker
              value={filterState}
              onChange={setFilterState}
            />
            <CreateCategoryDialog />
            <AddTransactionDialog />
          </div>
        </div>

        <StatsCards
          summary={summary || { income: 0, expense: 0, balance: 0, savingsRate: 0 }}
          isLoading={isLoading}
        />

        <YearOverview
          data={yearOverview || []}
          year={displayYear}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
