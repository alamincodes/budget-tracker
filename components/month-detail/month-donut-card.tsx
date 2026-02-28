"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Label,
} from "recharts";

interface MonthDonutCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default function MonthDonutCard({
  totalIncome,
  totalExpense,
  balance,
}: MonthDonutCardProps) {
  const incomeExpenseDonutData = [
    { name: "Income", value: totalIncome, fill: "var(--income)" },
    { name: "Expense", value: totalExpense, fill: "var(--expense)" },
  ].filter((d) => d.value > 0);

  if (incomeExpenseDonutData.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Income vs Expense</CardTitle>
          <p className="text-sm text-muted-foreground">
            Total income ৳{totalIncome.toLocaleString()} • Total expense ৳{totalExpense.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
            No data this month
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Income vs Expense</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total income ৳{totalIncome.toLocaleString()} • Total expense ৳{totalExpense.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
