"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

function formatDisplayDate(date: Date | undefined) {
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

/** Format Date to YYYY-MM-DD string */
export function toDateString(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Form use: value and onChange are string (YYYY-MM-DD) */
export interface DatePickerInputStringProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
}

export function DatePickerInputString({
  value,
  onChange,
  placeholder = "June 01, 2025",
  className,
  inputClassName,
  buttonClassName,
}: DatePickerInputStringProps) {
  const [open, setOpen] = React.useState(false);
  const dateFromValue = value ? new Date(value) : undefined;
  const [date, setDate] = React.useState<Date | undefined>(() => dateFromValue);
  const [month, setMonth] = React.useState<Date | undefined>(
    () => dateFromValue ?? new Date()
  );
  const [display, setDisplay] = React.useState(() =>
    formatDisplayDate(dateFromValue)
  );

  const dateToShow = date ?? dateFromValue;
  const displayToShow = display || formatDisplayDate(dateFromValue);

  return (
    <div
      className={
        className ??
        "flex rounded-xl border border-input bg-transparent shadow-xs overflow-hidden focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
      }
    >
      <Input
        value={displayToShow}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          setDisplay(v);
          const d = new Date(v);
          if (isValidDate(d)) {
            setDate(d);
            setMonth(d);
            onChange(toDateString(d));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`h-11 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 ${inputClassName ?? ""}`}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={
              buttonClassName ??
              "h-11 w-11 shrink-0 rounded-none border-l border-input"
            }
            aria-label="Select date"
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden rounded-xl border bg-popover p-0 shadow-lg"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={dateToShow}
            month={month}
            onMonthChange={setMonth}
            onSelect={(next) => {
              setDate(next);
              if (next) {
                setMonth(next);
                setDisplay(formatDisplayDate(next));
                onChange(toDateString(next));
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Filter use: value and onChange are Date | undefined */
export interface DatePickerInputDateProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  onClose?: () => void;
}

export function DatePickerInputDate({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  onClose,
}: DatePickerInputDateProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value ?? new Date());
  const [inputValue, setInputValue] = React.useState(formatDisplayDate(value));

  React.useEffect(() => {
    setInputValue(formatDisplayDate(value));
    if (value) setMonth(value);
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setInputValue(formatDisplayDate(date));
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
        <PopoverContent
          className="w-auto p-0 rounded-xl border shadow-lg"
          align="end"
          sideOffset={6}
        >
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
