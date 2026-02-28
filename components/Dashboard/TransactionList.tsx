import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { TransactionWithCategory } from "@/hooks/useTransactions";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  isLoading: boolean;
}

export default function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No transactions yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <div
              key={String(transaction._id)}
              className="flex items-center justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    transaction.type === "income" ? "bg-[var(--income)]/10 text-[var(--income)]" : "bg-[var(--expense)]/10 text-[var(--expense)]"
                  )}
                  style={
                    transaction.categoryId?.color
                      ? { backgroundColor: `${transaction.categoryId.color}20`, color: transaction.categoryId.color }
                      : undefined
                  }
                >
                  {transaction.type === "income" ? (
                    <ArrowUpIcon className="h-5 w-5" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {transaction.categoryId?.name || "Uncategorized"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {transaction.note || format(new Date(transaction.date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "shrink-0 text-sm font-semibold tabular-nums",
                  transaction.type === "income" ? "text-[var(--income)]" : "text-[var(--expense)]"
                )}
              >
                {transaction.type === "income" ? "+" : "−"}
                ৳{transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
