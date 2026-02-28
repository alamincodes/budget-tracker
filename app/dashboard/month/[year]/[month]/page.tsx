"use client";

import { useMonthData } from "@/hooks/useMonthData";
import MonthCharts from "../../../../../components/month-detail/month-charts";
import TransactionList from "../../../../../components/month-detail/transaction-list";
import Header from "../../../_components/header";
import AddTransactionDialog from "../../../_components/add-transaction-dialog";
import { format } from "date-fns";
import { Button } from "../../../../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function MonthPage() {
  const params = useParams();
  const router = useRouter();

  const year = parseInt(params.year as string);
  const month = parseInt(params.month as string);

  const { transactions, isLoading } = useMonthData(year, month);

  if (isNaN(year) || isNaN(month)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Invalid date</p>
      </div>
    );
  }

  const dateObj = new Date(year, month - 1);
  const dateLabel = !isNaN(dateObj.getTime()) ? format(dateObj, "MMMM yyyy") : "Invalid Date";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shrink-0"
              onClick={() => router.push("/dashboard")}
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{dateLabel}</h1>
              <p className="text-sm text-muted-foreground">Income vs expenses and transactions</p>
            </div>
          </div>
          <AddTransactionDialog defaultYear={year} defaultMonth={month} />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-80 rounded-2xl bg-muted/50 animate-pulse" />
            <div className="h-96 rounded-2xl bg-muted/50 animate-pulse" />
          </div>
        ) : (
          <>
            <MonthCharts transactions={transactions || []} />
            <TransactionList transactions={transactions || []} />
          </>
        )}
      </main>
    </div>
  );
}
