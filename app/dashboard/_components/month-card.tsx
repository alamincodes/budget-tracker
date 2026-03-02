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
  const balanceStr = formatBalanceCompact(balance);
  // Split long compact amount for two-line display in donut (e.g. "−৳1.5" + "Cr")
  const balanceMatch =
    balanceStr.length > 6 ? balanceStr.match(/^(.*?)(k|L|Cr)$/) : null;
  const balanceParts =
    balanceMatch && balanceMatch[2]
      ? ([balanceMatch[1], balanceMatch[2]] as [string, string])
      : null;
  const hasData = donutData.length > 0;
  const isCurrentMonth =
    new Date().getFullYear() === year &&
    new Date().getMonth() + 1 === monthData.month;

  return (
    <div
      onClick={() => router.push(`/dashboard/month/${year}/${monthData.month}`)}
      className={cn(
        "group flex flex-col items-center rounded-2xl border bg-card px-1.5 sm:px-2 py-2 sm:py-3 transition-all active:scale-[0.97] cursor-pointer min-h-[120px]",
        isCurrentMonth
          ? "border-primary/40 ring-4 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-neutral-100 dark:hover:bg-card/10",
      )}
    >
      {/* Month label */}
      <span
        className={cn(
          "text-[9px] sm:text-[11px] font-semibold mb-1 sm:mb-2",
          isCurrentMonth ? "text-primary" : "text-muted-foreground",
        )}
      >
        {MONTH_NAMES_FULL[monthData.month - 1]}
      </span>

      {/* Chart area */}
      <div className="w-full aspect-square max-h-[100px] sm:max-h-[100px] flex-1 min-h-0">
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
                      const fillColor =
                        balance >= 0 ? "var(--foreground)" : "var(--expense)";
                      const twoLines = balanceParts !== null;
                      return (
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {twoLines ? (
                            <>
                              <tspan
                                x={cx}
                                y={cy - 5}
                                fontSize="9"
                                fontWeight="700"
                                fill={fillColor}
                              >
                                {balanceParts[0]}
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 6}
                                fontSize="8"
                                fontWeight="700"
                                fill={fillColor}
                              >
                                {balanceParts[1]}
                              </tspan>
                            </>
                          ) : (
                            <tspan
                              x={cx}
                              y={cy}
                              fontSize="9"
                              fontWeight="700"
                              fill={fillColor}
                            >
                              {balanceStr}
                            </tspan>
                          )}
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

      {/* Bottom stats — amounts at bottom */}
      {hasData ? (
        <div className="mt-auto pt-1.5 sm:pt-2 flex justify-between w-full gap-1">
          <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-(--income) shrink-0" />
            <span className="truncate text-[10px] sm:text-sm font-medium text-muted-foreground">
              {formatBalanceCompact(monthData.income)}
            </span>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-(--expense) shrink-0" />
            <span className="truncate text-[10px] sm:text-sm font-medium text-muted-foreground">
              {formatBalanceCompact(monthData.expense)}
            </span>
          </div>
        </div>
      ) : (
        <span className="mt-auto pt-1.5 text-[8px] sm:text-[9px] text-muted-foreground/50">
          No data
        </span>
      )}
    </div>
  );
}
