"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
} from "recharts";
import { useRouter } from "next/navigation";
import { formatBalanceCompact, MONTH_NAMES_FULL } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MonthCardProps {
  monthData: {
    month: number;
    income: number;
    expense: number;
    openingBalance: number;
  };
  year: number;
}

export default function MonthCard({ monthData, year }: MonthCardProps) {
  const router = useRouter();

  const donutData = [
    { name: "Income", value: monthData.income, fill: "var(--income)" },
    { name: "Expense", value: monthData.expense, fill: "var(--expense)" },
  ].filter((d) => d.value > 0);

  const balance =
    monthData.openingBalance + monthData.income - monthData.expense;
  const hasData = donutData.length > 0;
  const isCurrentMonth =
    new Date().getFullYear() === year &&
    new Date().getMonth() + 1 === monthData.month;

  return (
    <div
      onClick={() => router.push(`/dashboard/month/${year}/${monthData.month}`)}
      className={cn(
        "group flex flex-col items-center rounded-2xl border bg-card px-2 py-3 transition-all active:scale-[0.97] cursor-pointer",
        isCurrentMonth
          ? "border-primary/40 ring-4 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-neutral-100 dark:hover:bg-card/10",
      )}
    >
      {/* Month label */}
      <span
        className={cn(
          "text-[11px] font-semibold mb-2",
          isCurrentMonth ? "text-primary" : "text-muted-foreground",
        )}
      >
        {MONTH_NAMES_FULL[monthData.month - 1]}
      </span>

      {/* Chart area */}
      <div className="w-full aspect-square max-h-[100px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--popover)",
                  color: "var(--popover-foreground)",
                  boxShadow: "none",
                  fontSize: "11px",
                  padding: "4px 8px",
                }}
                itemStyle={{ color: "var(--popover-foreground)" }}
                labelStyle={{ color: "var(--popover-foreground)" }}
                formatter={(v: number | undefined) => [
                  `৳${(v ?? 0).toLocaleString()}`,
                  "",
                ]}
                labelFormatter={() => MONTH_NAMES_FULL[monthData.month - 1]}
              />
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius="50%"
                outerRadius="88%"
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
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={cx}
                            y={cy}
                            fontSize="10"
                            fontWeight="700"
                            fill={
                              balance >= 0
                                ? "var(--foreground)"
                                : "var(--expense)"
                            }
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
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle
              cx="40"
              cy="40"
              r="30"
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            <circle cx="40" cy="40" r="3" fill="var(--border)" />
          </svg>
        )}
      </div>

      {/* Bottom stats */}
      {hasData ? (
        <div className="mt-2 flex justify-between w-full">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-(--income) shrink-0" />
            <span className="truncate text-sm font-medium text-muted-foreground">
              {formatBalanceCompact(monthData.income)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-(--expense) shrink-0" />
            <span className="truncate text-sm font-medium text-muted-foreground">
              {formatBalanceCompact(monthData.expense)}
            </span>
          </div>
        </div>
      ) : (
        <span className="mt-2 text-[9px] text-muted-foreground/50">
          No data
        </span>
      )}
    </div>
  );
}
