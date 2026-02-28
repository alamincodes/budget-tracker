"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  borderRadius: "12px",
  border: "none",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className={`text-lg font-semibold ${titleClassName ?? ""}`}>
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent className="h-[280px]">
          <div className="flex h-full items-center justify-center rounded-xl bg-muted/50 text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className={`text-lg font-semibold ${titleClassName ?? ""}`}>
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
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
            <Bar dataKey="value" radius={5} fill={defaultBarColor}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value > 0 ? entry.color || defaultBarColor : "transparent"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
