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
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Year overview</h2>
        <p className="text-sm text-muted-foreground">Click a month to see details</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((monthData) => {
          const donutData = [
            { name: "Income", value: monthData.income, fill: "var(--income)" },
            { name: "Expense", value: monthData.expense, fill: "var(--expense)" },
          ].filter((d) => d.value > 0);
          const balance = monthData.income - monthData.expense;
          const hasData = donutData.length > 0;

          return (
            <Card
              key={monthData.month}
              className="cursor-pointer rounded-2xl border shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
              onClick={() => router.push(`/dashboard/month/${year}/${monthData.month}`)}
            >
              <CardHeader className="pb-1 pt-5">
                <CardTitle className="text-center text-sm font-semibold text-foreground">
                  {MONTH_NAMES_FULL[monthData.month - 1]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-5">
                <div className="mx-auto aspect-square w-full max-h-[140px]">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value: number | undefined) => [`৳${(value ?? 0).toLocaleString()}`, ""]}
                          labelFormatter={() => MONTH_NAMES_FULL[monthData.month - 1]}
                        />
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="55%"
                          outerRadius="95%"
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
                                    className="max-w-full overflow-hidden"
                                  >
                                    <tspan
                                      x={cx}
                                      y={cy}
                                      className="fill-foreground text-xs font-bold sm:text-sm"
                                    >
                                      {formatBalanceCompact(balance)}
                                    </tspan>
                                    <tspan
                                      x={cx}
                                      y={cy + 14}
                                      className="fill-muted-foreground text-[9px]"
                                    >
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
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted/50 text-xs text-muted-foreground">
                      No data
                    </div>
                  )}
                </div>
                <div className="mt-2 flex w-full flex-col gap-0.5 text-center text-xs">
                  <span className="font-medium text-[var(--income)]">
                    In: ৳{monthData.income.toLocaleString()}
                  </span>
                  <span className="font-medium text-[var(--expense)]">
                    Out: ৳{monthData.expense.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
