"use client";

import { useState } from "react";
import { TransactionWithCategory } from "@/hooks/useTransactions";
import { groupByCategory, padCategoryData } from "@/lib/chart-utils";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface MonthChartsProps {
  transactions: TransactionWithCategory[];
}

type Tab = "overview" | "income" | "expense";

const tooltipContentStyle = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  boxShadow: "none",
  fontSize: "12px",
  padding: "6px 10px",
};
const tooltipItemStyle = { color: "var(--popover-foreground)" };
const tooltipLabelStyle = { color: "var(--popover-foreground)" };

export default function MonthCharts({ transactions }: MonthChartsProps) {
  const [tab, setTab] = useState<Tab>("overview");

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

  const donutData = [
    { name: "Income", value: totalIncome, fill: "var(--income)" },
    { name: "Expense", value: totalExpense, fill: "var(--expense)" },
  ].filter((d) => d.value > 0);

  const tabs: { value: Tab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Summary row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Income</p>
          <p className="text-sm font-bold text-[var(--income)] tabular-nums mt-0.5">
            ৳{totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Expense</p>
          <p className="text-sm font-bold text-[var(--expense)] tabular-nums mt-0.5">
            ৳{totalExpense.toLocaleString()}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Balance</p>
          <p
            className={cn(
              "text-sm font-bold tabular-nums mt-0.5",
              balance >= 0 ? "text-foreground" : "text-[var(--expense)]"
            )}
          >
            ৳{balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold transition-colors",
              tab === t.value
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="p-4">
        {tab === "overview" && (
          <OverviewChart donutData={donutData} balance={balance} totalIncome={totalIncome} totalExpense={totalExpense} />
        )}
        {tab === "income" && (
          <BarChartContent data={incomeChartData} defaultColor="var(--income)" emptyMessage="No income this month" />
        )}
        {tab === "expense" && (
          <BarChartContent data={expenseChartData} defaultColor="var(--expense)" emptyMessage="No expenses this month" />
        )}
      </div>
    </div>
  );
}

function OverviewChart({
  donutData,
  balance,
  totalIncome,
  totalExpense,
}: {
  donutData: { name: string; value: number; fill: string }[];
  balance: number;
  totalIncome: number;
  totalExpense: number;
}) {
  if (donutData.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        No data this month
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="h-[200px] w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: unknown) => [`৳${Number(value ?? 0).toLocaleString()}`, ""]}
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
            />
            <Pie
              data={donutData}
              dataKey="value"
              innerRadius="52%"
              outerRadius="85%"
              strokeWidth={2}
              stroke="var(--card)"
              paddingAngle={2}
            >
              {donutData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const cx = viewBox.cx as number;
                    const cy = viewBox.cy as number;
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={cx} y={cy - 6} fontSize="16" fontWeight="700" fill="var(--foreground)">
                          ৳{Math.abs(balance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </tspan>
                        <tspan x={cx} y={cy + 12} fontSize="10" fill="var(--muted-foreground)">
                          {balance >= 0 ? "saved" : "deficit"}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--income)]" />
          <span className="text-xs text-muted-foreground">
            Income <span className="font-semibold text-foreground">৳{totalIncome.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--expense)]" />
          <span className="text-xs text-muted-foreground">
            Expense <span className="font-semibold text-foreground">৳{totalExpense.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function BarChartContent({
  data,
  defaultColor,
  emptyMessage,
}: {
  data: (ReturnType<typeof padCategoryData>[0] & { name: string })[];
  defaultColor: string;
  emptyMessage: string;
}) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8 }}>
          <YAxis
            dataKey="name"
            type="category"
            width={90}
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <XAxis dataKey="value" type="number" hide />
          <Tooltip
            cursor={false}
            formatter={(value: unknown) => [`৳${Number(value ?? 0).toLocaleString()}`, ""]}
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
          />
          <Bar dataKey="value" radius={4} fill={defaultColor}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.value > 0 ? entry.color || defaultColor : "transparent"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
