"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type DateFilterState,
  type FilterPreset,
  formatFilterLabel,
  getDateRangeFromFilter,
  getDefaultDateFilterState,
} from "@/types/filters";
import { DatePickerInputDate } from "@/components/ui/date-picker-input";
import { cn } from "@/lib/utils";

const PRESETS: { value: FilterPreset; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "specific_date", label: "Specific date" },
  { value: "specific_year", label: "Specific year" },
  { value: "custom_range", label: "Custom range" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - 5 + i);

export interface DateFilterPickerProps {
  value: DateFilterState;
  onChange: (state: DateFilterState) => void;
  onRangeChange?: (range: { from: string; to: string } | null) => void;
  className?: string;
}

export function DateFilterPicker({
  value,
  onChange,
  onRangeChange,
  className,
}: DateFilterPickerProps) {
  const [expanded, setExpanded] = React.useState(false);
  const state = value.preset ? value : getDefaultDateFilterState();

  const range = getDateRangeFromFilter(state);
  React.useEffect(() => {
    onRangeChange?.(range ?? null);
  }, [range?.from, range?.to, onRangeChange]);

  const apply = (next: DateFilterState) => {
    onChange(next);
  };

  const applyAndCollapse = (next: DateFilterState) => {
    onChange(next);
    setExpanded(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-10 min-w-[160px] justify-between gap-2 rounded-xl font-normal text-sm bg-white",
        )}
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="truncate">{formatFilterLabel(state)}</span>
        {expanded ? (
          <ChevronUpIcon className="size-4 shrink-0 opacity-60" />
        ) : (
          <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
        )}
      </Button>

      {expanded && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setExpanded(false)}
          />
          <div
            className="absolute top-full right-0 z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Range preset
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-1.5 dark:bg-muted/20 bg-muted/50 rounded-lg p-2">
                  {PRESETS.map((p) => (
                    <Button
                      key={p.value}
                      type="button"
                      variant={state.preset === p.value ? "default" : "ghost"}
                      size="sm"
                      className="h-8 rounded-lg justify-start text-sm font-normal"
                      onClick={() => {
                        const next: DateFilterState = {
                          ...state,
                          preset: p.value,
                          specificDate: state.specificDate ?? new Date(),
                          specificYear:
                            state.specificYear ?? new Date().getFullYear(),
                          customFrom:
                            state.customFrom ??
                            new Date(new Date().getFullYear(), 0, 1),
                          customTo: state.customTo ?? new Date(),
                        };
                        if (p.value === "specific_date" && !next.specificDate)
                          next.specificDate = new Date();
                        if (p.value === "specific_year" && !next.specificYear)
                          next.specificYear = new Date().getFullYear();
                        if (p.value === "custom_range") {
                          if (!next.customFrom)
                            next.customFrom = new Date(
                              new Date().getFullYear(),
                              0,
                              1,
                            );
                          if (!next.customTo) next.customTo = new Date();
                        }
                        apply(next);
                        if (
                          p.value === "daily" ||
                          p.value === "weekly" ||
                          p.value === "monthly" ||
                          p.value === "yearly"
                        ) {
                          setExpanded(false);
                        }
                      }}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              {state.preset === "specific_date" && (
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePickerInputDate
                    value={state.specificDate}
                    onChange={(date) =>
                      applyAndCollapse({ ...state, specificDate: date })
                    }
                    placeholder="Select date"
                    onClose={() => setExpanded(false)}
                  />
                </div>
              )}

              {state.preset === "specific_year" && (
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={String(
                      state.specificYear ?? new Date().getFullYear(),
                    )}
                    onValueChange={(v) =>
                      applyAndCollapse({
                        ...state,
                        specificYear: parseInt(v, 10),
                      })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {state.preset === "custom_range" && (
                <div className="space-y-3">
                  <Label>From – To</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">
                        From
                      </span>
                      <DatePickerInputDate
                        value={state.customFrom}
                        onChange={(date) =>
                          apply({ ...state, customFrom: date })
                        }
                        placeholder="Start date"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">To</span>
                      <DatePickerInputDate
                        value={state.customTo}
                        onChange={(date) => apply({ ...state, customTo: date })}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    type="button"
                    className="w-full rounded-xl"
                    onClick={() => setExpanded(false)}
                  >
                    Apply range
                  </Button>
                </div>
              )}

              {(state.preset === "daily" ||
                state.preset === "weekly" ||
                state.preset === "monthly" ||
                state.preset === "yearly") && (
                <p className="text-xs text-muted-foreground">
                  Showing data for current {state.preset} period. Change preset
                  above to see a different range.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
