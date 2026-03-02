"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryChartDatum } from "@/lib/chart-utils";

const tooltipStyle = {
  borderRadius: "10px",
  border: "1px solid var(--border)",
  boxShadow: "none",
  fontSize: "12px",
};

interface CategoryBarChartProps {
  title: string;
  titleClassName?: string;
  subtitle: string;
  data: (CategoryChartDatum & { name: string })[];
  emptyMessage: string;
  defaultBarColor: string;
}

export default function CategoryBarChart({
  title,
  titleClassName,
  subtitle,
  data,
  emptyMessage,
  defaultBarColor,
}: CategoryBarChartProps) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className={`text-sm font-semibold text-foreground mb-0.5 ${titleClassName ?? ""}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className={`text-sm font-semibold text-foreground mb-0.5 ${titleClassName ?? ""}`}>
        {title}
      </p>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 12 }}
          >
            <YAxis
              dataKey="name"
              type="category"
              width={96}
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(name) => (name ? name : "")}
            />
            <XAxis dataKey="value" type="number" hide />
            <Tooltip
              cursor={false}
              formatter={(value: unknown) => [`৳${Number(value ?? 0).toLocaleString()}`, ""]}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="value" radius={4} fill={defaultBarColor}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? entry.color || defaultBarColor : "transparent"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
