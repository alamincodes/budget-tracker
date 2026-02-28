import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compact balance for small spaces (e.g. ৳1.5k, ৳1.5L, ৳1.5Cr) */
export function formatBalanceCompact(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? "−" : ""
  if (abs >= 1_00_00_000) return `${sign}৳${(abs / 1_00_00_000).toFixed(1)}Cr`
  if (abs >= 1_00_000) return `${sign}৳${(abs / 1_00_000).toFixed(1)}L`
  if (abs >= 1000) return `${sign}৳${(abs / 1000).toFixed(1)}k`
  return `${sign}৳${Math.round(abs)}`
}

/** Full month names (January … December) for display */
export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const
