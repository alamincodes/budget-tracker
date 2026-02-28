import type { TransactionWithCategory } from "@/hooks/useTransactions";

export interface CategoryChartDatum {
  name: string;
  value: number;
  color: string;
}

/** Group transactions by category for a given type (income/expense) */
export function groupByCategory(
  transactions: TransactionWithCategory[],
  type: "income" | "expense"
): CategoryChartDatum[] {
  const filtered = transactions.filter((t) => t.type === type);
  const map = filtered.reduce(
    (acc, curr) => {
      if (!curr.categoryId || typeof curr.categoryId === "string") return acc;
      const catName = curr.categoryId.name;
      const catColor = curr.categoryId.color;
      if (!acc[catName]) {
        acc[catName] = { name: catName, value: 0, color: catColor };
      }
      acc[catName].value += curr.amount;
      return acc;
    },
    {} as Record<string, CategoryChartDatum>
  );
  return Object.values(map).sort((a, b) => b.value - a.value);
}

const DEFAULT_MAX_BARS = 6;

/** Pad category data to a fixed length for consistent chart height (empty bars) */
export function padCategoryData(
  list: CategoryChartDatum[],
  maxBars = DEFAULT_MAX_BARS
): (CategoryChartDatum & { name: string })[] {
  const slice = list.slice(0, maxBars);
  const padded = [...slice];
  while (padded.length < maxBars) {
    padded.push({ name: "", value: 0, color: "transparent" });
  }
  return padded;
}
