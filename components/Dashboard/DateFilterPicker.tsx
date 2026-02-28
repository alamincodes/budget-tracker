"use client";

import * as React from "react";
import { CalendarIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

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

interface DatePickerInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  onClose?: () => void;
}

function DatePickerInput({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  onClose,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value ?? new Date());
  const [inputValue, setInputValue] = React.useState(formatDate(value));

  React.useEffect(() => {
    setInputValue(formatDate(value));
    if (value) setMonth(value);
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setInputValue(formatDate(date));
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex rounded-xl border border-input bg-transparent shadow-xs overflow-hidden focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring">
          <Input
            id={id}
            value={inputValue}
            placeholder={placeholder}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              const d = new Date(v);
              if (isValidDate(d)) {
                onChange(d);
                setMonth(d);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
            className="h-9 rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-9 w-9 shrink-0 rounded-none border-l border-input"
              aria-label="Open calendar"
            >
              <CalendarIcon className="size-4" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0 rounded-xl border shadow-lg" align="end" sideOffset={6}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            defaultMonth={value ?? new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface DateFilterPickerProps {
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
          "h-10 min-w-[200px] justify-between gap-2 rounded-xl font-normal shadow-sm"
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
            className="absolute top-full left-0 z-50 mt-2 w-[360px] rounded-2xl border bg-popover p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Range preset
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
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
                          specificYear: state.specificYear ?? new Date().getFullYear(),
                          customFrom: state.customFrom ?? new Date(new Date().getFullYear(), 0, 1),
                          customTo: state.customTo ?? new Date(),
                        };
                        if (p.value === "specific_date" && !next.specificDate)
                          next.specificDate = new Date();
                        if (p.value === "specific_year" && !next.specificYear)
                          next.specificYear = new Date().getFullYear();
                        if (p.value === "custom_range") {
                          if (!next.customFrom) next.customFrom = new Date(new Date().getFullYear(), 0, 1);
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
                  <DatePickerInput
                    value={state.specificDate}
                    onChange={(date) => applyAndCollapse({ ...state, specificDate: date })}
                    placeholder="Select date"
                    onClose={() => setExpanded(false)}
                  />
                </div>
              )}

              {state.preset === "specific_year" && (
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={String(state.specificYear ?? new Date().getFullYear())}
                    onValueChange={(v) =>
                      applyAndCollapse({ ...state, specificYear: parseInt(v, 10) })
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
                      <span className="text-xs text-muted-foreground">From</span>
                      <DatePickerInput
                        value={state.customFrom}
                        onChange={(date) => apply({ ...state, customFrom: date })}
                        placeholder="Start date"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-xs text-muted-foreground">To</span>
                      <DatePickerInput
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
                  Showing data for current {state.preset} period. Change preset above to
                  see a different range.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
