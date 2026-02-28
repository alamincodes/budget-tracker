import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export type FilterPreset =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "specific_date"
  | "specific_year"
  | "custom_range";

export interface DateFilterState {
  preset: FilterPreset;
  /** For specific_date: the selected day */
  specificDate?: Date;
  /** For specific_year: the selected year (e.g. 2025) */
  specificYear?: number;
  /** For custom_range */
  customFrom?: Date;
  customTo?: Date;
}

export interface DateRange {
  from: string; // ISO
  to: string; // ISO
}

/** Get ISO date range from current filter state. */
export function getDateRangeFromFilter(state: DateFilterState): DateRange | null {
  const now = new Date();

  switch (state.preset) {
    case "daily": {
      const from = startOfDay(now);
      const to = endOfDay(now);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "weekly": {
      const from = startOfWeek(now, { weekStartsOn: 0 });
      const to = endOfWeek(now, { weekStartsOn: 0 });
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "monthly": {
      const from = startOfMonth(now);
      const to = endOfMonth(now);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "yearly": {
      const from = startOfYear(now);
      const to = endOfYear(now);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "specific_date": {
      if (!state.specificDate) return null;
      const from = startOfDay(state.specificDate);
      const to = endOfDay(state.specificDate);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "specific_year": {
      const y = state.specificYear ?? now.getFullYear();
      const from = startOfYear(new Date(y, 0, 1));
      const to = endOfYear(new Date(y, 11, 31));
      return { from: from.toISOString(), to: to.toISOString() };
    }
    case "custom_range": {
      if (!state.customFrom || !state.customTo) return null;
      const from = startOfDay(state.customFrom);
      const to = endOfDay(state.customTo);
      if (from.getTime() > to.getTime()) return null;
      return { from: from.toISOString(), to: to.toISOString() };
    }
    default:
      return null;
  }
}

/** Default filter: current month */
export function getDefaultDateFilterState(): DateFilterState {
  return {
    preset: "monthly",
    specificDate: new Date(),
    specificYear: new Date().getFullYear(),
    customFrom: startOfMonth(new Date()),
    customTo: endOfMonth(new Date()),
  };
}

/** Format filter state for display (e.g. "Feb 2025", "Jan 1 – Jan 7, 2025") */
export function formatFilterLabel(state: DateFilterState): string {
  const range = getDateRangeFromFilter(state);
  if (!range) return "Select range";

  const fromDate = new Date(range.from);
  const toDate = new Date(range.to);

  const sameDay =
    fromDate.toDateString() === toDate.toDateString();
  const sameMonth =
    fromDate.getMonth() === toDate.getMonth() &&
    fromDate.getFullYear() === toDate.getFullYear();
  const sameYear = fromDate.getFullYear() === toDate.getFullYear();

  const fmtShort = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtMonthYear = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const fmtYear = (d: Date) => d.getFullYear().toString();

  if (sameDay) return fmtShort(fromDate);
  if (sameMonth) return `${fromDate.getDate()} – ${toDate.getDate()}, ${fmtMonthYear(fromDate)}`;
  if (sameYear) return `${fmtShort(fromDate)} – ${fmtShort(toDate)}`;
  return `${fmtShort(fromDate)} – ${fmtShort(toDate)}`;
}
