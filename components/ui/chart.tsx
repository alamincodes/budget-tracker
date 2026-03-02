"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  { label?: string; color?: string; icon?: React.ComponentType<{ className?: string }> }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}) {
  const id = React.useId();
  const uniqueId = id.replace(/:/g, "");

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("w-full", className)}
        style={
          {
            ...Object.fromEntries(
              Object.entries(config).flatMap(([key, value]) =>
                value?.color ? [[`--color-${key}`, value.color]] : []
              )
            ),
          } as React.CSSProperties
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({
  content,
  cursor = false,
  ...props
}: React.ComponentProps<typeof Tooltip> & {
  content: React.ReactElement;
}) {
  return <Tooltip cursor={cursor} content={content} {...props} />;
}

export interface ChartTooltipContentProps extends React.ComponentPropsWithoutRef<"div"> {
  hideLabel?: boolean;
  labelKey?: string;
  nameKey?: string;
  formatter?: (value: number, name: string) => React.ReactNode;
  labelFormatter?: (label: unknown) => React.ReactNode;
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string; color?: string }>;
  label?: string;
}

export function ChartTooltipContent({
  hideLabel,
  labelFormatter,
  formatter,
  className,
  active,
  payload,
  label,
  ...props
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && label != null && (
        <div className="font-medium">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div
            key={index}
            className="flex w-full items-center gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground flex-1">{item.name}</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {formatter ? formatter(item.value, item.name) : item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
