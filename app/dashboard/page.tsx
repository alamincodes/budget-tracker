"use client";

import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import StatsCards from "./_components/stats-cards";
import YearOverview from "./_components/year-overview";
import AddTransactionDialog from "./_components/add-transaction-dialog";
import { DateFilterPicker } from "./_components/date-filter-picker";
import CreateCategoryDialog from "./_components/create-category-dialog";
import {
  getDefaultDateFilterState,
  getDateRangeFromFilter,
  type DateFilterState,
} from "@/types/filters";

const currentYear = () => new Date().getFullYear();

export default function DashboardPage() {
  const [filterState, setFilterState] = useState<DateFilterState>(
    getDefaultDateFilterState(),
  );
  const range = useMemo(
    () => getDateRangeFromFilter(filterState),
    [filterState],
  );
  const filters = useMemo(
    () => (range ? { from: range.from, to: range.to } : {}),
    [range],
  );
  const displayYear =
    filterState.preset === "specific_year" && filterState.specificYear != null
      ? filterState.specificYear
      : currentYear();
  const { summary, yearOverview, isLoading } = useDashboard({
    filters,
    year: displayYear,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 pt-6 pb-24 sm:pb-10 max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Overview
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your finances
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateFilterPicker value={filterState} onChange={setFilterState} />
            <div className="hidden sm:flex items-center gap-2">
              <CreateCategoryDialog />
              <AddTransactionDialog />
            </div>
          </div>
        </div>

        <StatsCards
          summary={
            summary || { income: 0, expense: 0, balance: 0, savingsRate: 0 }
          }
          isLoading={isLoading}
        />

        <div className="sm:hidden grid grid-cols-2 gap-2">
          <CreateCategoryDialog triggerClassName="w-full justify-center" />
          <AddTransactionDialog triggerClassName="w-full justify-center" />
        </div>

        <YearOverview
          data={yearOverview || []}
          year={displayYear}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
