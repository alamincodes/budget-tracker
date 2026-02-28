"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
} from "recharts";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBalanceCompact, MONTH_NAMES_FULL } from "@/lib/utils";

interface YearOverviewProps {
  data: {
    month: number;
    income: number;
    expense: number;
  }[];
  year: number;
  isLoading: boolean;
}

export default function YearOverview({ data, year, isLoading }: YearOverviewProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{year} overview</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Tap a month to view details</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((monthData) => {
          const donutData = [
            { name: "Income", value: monthData.income, fill: "var(--income)" },
            { name: "Expense", value: monthData.expense, fill: "var(--expense)" },
          ].filter((d) => d.value > 0);
          const balance = monthData.income - monthData.expense;
          const hasData = donutData.length > 0;

          return (
            <button
              key={monthData.month}
              className="cursor-pointer rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/30 active:scale-[0.98]"
              onClick={() => router.push(`/dashboard/month/${year}/${monthData.month}`)}
            >
              <p className="text-center text-xs font-semibold text-foreground mb-2">
                {MONTH_NAMES_FULL[monthData.month - 1]}
              </p>
              <div className="mx-auto aspect-square w-full max-h-[120px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          boxShadow: "none",
                          fontSize: "12px",
                        }}
                        formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
                        labelFormatter={() => MONTH_NAMES_FULL[monthData.month - 1]}
                      />
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="52%"
                        outerRadius="90%"
                        strokeWidth={2}
                        stroke="var(--card)"
                        paddingAngle={2}
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              const cx = viewBox.cx as number;
                              const cy = viewBox.cy as number;
                              return (
                                <text
                                  x={cx}
                                  y={cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={cx}
                                    y={cy}
                                    className="fill-foreground font-bold"
                                    fontSize="11"
                                  >
                                    {formatBalanceCompact(balance)}
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
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted text-[10px] text-muted-foreground">
                    No data
                  </div>
                )}
              </div>
              <div className="mt-2 flex w-full justify-between text-[10px] font-medium">
                <span className="text-[var(--income)]">+৳{monthData.income.toLocaleString()}</span>
                <span className="text-[var(--expense)]">-৳{monthData.expense.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
