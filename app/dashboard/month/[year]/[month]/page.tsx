"use client";

import { useMonthData } from "@/hooks/useMonthData";
import { usePlannedItems } from "@/hooks/usePlannedItems";
import MonthCharts from "../../../../../components/month-detail/month-charts";
import TransactionList from "../../../../../components/month-detail/transaction-list";
import PlannedListSection from "../../../../../components/month-detail/planned-list-section";
import Header from "../../../_components/header";
import AddTransactionDialog from "../../../_components/add-transaction-dialog";
import { format } from "date-fns";
import { Button } from "../../../../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function MonthPage() {
  const params = useParams();
  const router = useRouter();

  const year = parseInt(params.year as string);
  const rawMonth = parseInt(params.month as string);
  const month = Math.min(12, Math.max(1, isNaN(rawMonth) ? new Date().getMonth() + 1 : rawMonth));

  const { transactions, isLoading } = useMonthData(year, month);
  const {
    items: plannedItems,
    isLoading: plannedLoading,
    createItem,
    markDone,
    undo,
    deleteItem,
  } = usePlannedItems(year, month);

  const [markDoneId, setMarkDoneId] = useState<string | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);

  const handleMarkDone = (id: string) => {
    setMarkDoneId(id);
    markDone.mutate(id, {
      onSettled: () => setMarkDoneId(null),
    });
  };

  const handleUndo = (id: string) => {
    setUndoId(id);
    undo.mutate(id, {
      onSettled: () => setUndoId(null),
    });
  };

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

        <PlannedListSection
          year={year}
          month={month}
          items={plannedItems}
          isLoading={plannedLoading}
          onCreate={(body) => createItem.mutateAsync(body)}
          createPending={createItem.isPending}
          onMarkDone={handleMarkDone}
          onUndo={handleUndo}
          onDelete={(id) => deleteItem.mutate(id)}
          markDonePendingId={markDoneId}
          undoPendingId={undoId}
        />

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
