"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Label,
} from "recharts";
import { TransactionWithCategory } from "@/hooks/useTransactions";

interface MonthChartsProps {
  transactions: TransactionWithCategory[];
}

function groupByCategory(
  transactions: TransactionWithCategory[],
  type: "income" | "expense"
) {
  const filtered = transactions.filter((t) => t.type === type);
  const map = filtered.reduce(
    (acc, curr) => {
      if (!curr.categoryId || typeof curr.categoryId === "string") return acc;
      const catName = curr.categoryId.name;
      const catColor = curr.categoryId.color;
      if (!acc[catName]) {
        acc[catName] = { name: catName, value: 0, color: catColor };
      }
      acc[catName].value += curr.amount;
      return acc;
    },
    {} as Record<string, { name: string; value: number; color: string }>
  );
  return Object.values(map).sort((a, b) => b.value - a.value);
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

  const MAX_BARS = 6;
  const padCategoryData = (
    list: { name: string; value: number; color: string }[]
  ) => {
    const slice = list.slice(0, MAX_BARS);
    const padded = [...slice];
    while (padded.length < MAX_BARS) {
      padded.push({ name: "", value: 0, color: "transparent" });
    }
    return padded;
  };
  const incomeChartData = padCategoryData(incomeByCategory);
  const expenseChartData = padCategoryData(expenseByCategory);

  const incomeExpenseDonutData = [
    { name: "Income", value: totalIncome, fill: "var(--income)" },
    { name: "Expense", value: totalExpense, fill: "var(--expense)" },
  ].filter((d) => d.value > 0);

  const tooltipStyle = {
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-6">
      {/* Income vs Expense breakdown */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Income vs Expense</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total income ৳{totalIncome.toLocaleString()} • Total expense ৳{totalExpense.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          {incomeExpenseDonutData.length > 0 ? (
            <div className="mx-auto h-[260px] w-full max-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
                    contentStyle={tooltipStyle}
                  />
                  <Pie
                    data={incomeExpenseDonutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="90%"
                    strokeWidth={2}
                    stroke="var(--card)"
                    paddingAngle={2}
                  >
                    {incomeExpenseDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const cx = viewBox.cx as number;
                          const cy = viewBox.cy as number;
                          return (
                            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={cx} y={cy} className="fill-foreground text-2xl font-bold">
                                ৳{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </tspan>
                              <tspan x={cx} y={(cy ?? 0) + 22} className="fill-muted-foreground text-sm">
                                Balance
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
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
              No data this month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top income & Top expense categories side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--income)]">
              Top income categories
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              ৳{totalIncome.toLocaleString()} total income
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeChartData}
                  layout="vertical"
                  margin={{ left: 0, right: 12 }}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(name) => (name ? name : "")}
                  />
                  <XAxis dataKey="value" type="number" hide />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="value" radius={5} fill="var(--income)">
                    {incomeChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 0 ? entry.color || "var(--income)" : "transparent"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-muted/50 text-muted-foreground text-sm">
                No income this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--expense)]">
              Top expense categories
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              ৳{totalExpense.toLocaleString()} total expense
            </p>
          </CardHeader>
          <CardContent className="h-[280px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseChartData}
                  layout="vertical"
                  margin={{ left: 0, right: 12 }}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(name) => (name ? name : "")}
                  />
                  <XAxis dataKey="value" type="number" hide />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
                    contentStyle={tooltipStyle}
                  />
                  <Bar dataKey="value" radius={5} fill="var(--expense)">
                    {expenseChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 0 ? entry.color || "var(--expense)" : "transparent"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-muted/50 text-muted-foreground text-sm">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
