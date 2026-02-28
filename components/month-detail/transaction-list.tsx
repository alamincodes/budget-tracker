"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionWithCategory } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              No transactions this month
            </div>
          ) : (
            transactions.map((t) => (
              <div
                key={String(t._id)}
                className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: t.categoryId?.color || "var(--muted-foreground)" }}
                  >
                    {t.categoryId?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.categoryId?.name || "Uncategorized"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {format(new Date(t.date), "MMM d, yyyy")} · {t.note || "No note"}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "shrink-0 font-semibold tabular-nums",
                    t.type === "income" ? "text-[var(--income)]" : "text-[var(--expense)]"
                  )}
                >
                  {t.type === "income" ? "+" : "−"}৳{t.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
