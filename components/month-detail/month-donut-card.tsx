"use client";

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
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold text-foreground mb-0.5">Income vs Expense</p>
        <p className="text-xs text-muted-foreground mb-4">
          +৳{totalIncome.toLocaleString()} income · -৳{totalExpense.toLocaleString()} expense
        </p>
        <div className="flex h-[180px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          No data this month
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold text-foreground mb-0.5">Income vs Expense</p>
      <p className="text-xs text-muted-foreground mb-2">
        +৳{totalIncome.toLocaleString()} income · -৳{totalExpense.toLocaleString()} expense
      </p>
      <div className="mx-auto h-[240px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid var(--border)",
                boxShadow: "none",
                fontSize: "12px",
              }}
            />
            <Pie
              data={incomeExpenseDonutData}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="88%"
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
                        <tspan x={cx} y={cy} className="fill-foreground font-bold" fontSize="20">
                          ৳{balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </tspan>
                        <tspan x={cx} y={(cy ?? 0) + 20} className="fill-muted-foreground" fontSize="11">
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
    </div>
  );
}
