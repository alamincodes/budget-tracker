"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range: ReactDayPickerDateRange | undefined) => {
    if (range) {
      onDateRangeChange({ from: range.from, to: range.to });
    } else {
      onDateRangeChange({ from: undefined, to: undefined });
    }
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    } else if (dateRange.from) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ...`;
    }
    return placeholder;
  };

  const clearDateRange = () => {
    onDateRangeChange({ from: undefined, to: undefined });
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange.from && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
          <div className="flex items-center justify-between border-t p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearDateRange}
              className="text-xs"
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)} className="text-xs">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
