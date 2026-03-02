"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MonthCard from "./month-card";

interface YearOverviewProps {
  data: {
    month: number;
    income: number;
    expense: number;
    openingBalance: number;
  }[];
  year: number;
  isLoading: boolean;
}

export default function YearOverview({
  data,
  year,
  isLoading,
}: YearOverviewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold text-foreground">{year}</h2>
        <span className="text-xs text-muted-foreground">
          Tap a month to explore
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        {data.map((monthData) => (
          <MonthCard key={monthData.month} monthData={monthData} year={year} />
        ))}
      </div>
    </div>
  );
}
