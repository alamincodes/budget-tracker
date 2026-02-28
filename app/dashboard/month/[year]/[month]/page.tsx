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
      <main className="flex-1 container mx-auto px-4 pt-5 pb-24 sm:pb-10 max-w-6xl space-y-4">

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg shrink-0"
              onClick={() => router.push("/dashboard")}
              aria-label="Back to dashboard"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-foreground leading-tight">
                {dateLabel}
              </h1>
              <p className="text-[11px] text-muted-foreground">Monthly summary</p>
            </div>
          </div>
          <AddTransactionDialog defaultYear={year} defaultMonth={month} />
        </div>

        {/* Planned checklist */}
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

        {/* Charts + Transactions */}
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-[320px] rounded-2xl bg-muted animate-pulse" />
            <div className="h-[200px] rounded-2xl bg-muted animate-pulse" />
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
