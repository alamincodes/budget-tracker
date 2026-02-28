"use client";

import { TransactionWithCategory } from "@/hooks/useTransactions";
import { groupByCategory, padCategoryData } from "@/lib/chart-utils";
import MonthDonutCard from "./month-donut-card";
import CategoryBarChart from "./category-bar-chart";

interface MonthChartsProps {
  transactions: TransactionWithCategory[];
}

export default function MonthCharts({ transactions }: MonthChartsProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomeByCategory = groupByCategory(transactions, "income");
  const expenseByCategory = groupByCategory(transactions, "expense");

  const incomeChartData = padCategoryData(incomeByCategory);
  const expenseChartData = padCategoryData(expenseByCategory);

  return (
    <div className="space-y-6">
      <MonthDonutCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <CategoryBarChart
          title="Top income categories"
          titleClassName="text-[var(--income)]"
          subtitle={`৳${totalIncome.toLocaleString()} total income`}
          data={incomeChartData}
          emptyMessage="No income this month"
          defaultBarColor="var(--income)"
        />
        <CategoryBarChart
          title="Top expense categories"
          titleClassName="text-[var(--expense)]"
          subtitle={`৳${totalExpense.toLocaleString()} total expense`}
          data={expenseChartData}
          emptyMessage="No expenses this month"
          defaultBarColor="var(--expense)"
        />
      </div>
    </div>
  );
}
