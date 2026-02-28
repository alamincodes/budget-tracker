import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  summary: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ summary, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-3.5 w-20 mb-3" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Income",
      value: formatCurrency(summary.income),
      icon: ArrowUpIcon,
      iconColor: "text-[var(--income)]",
      iconBg: "bg-[var(--income)]/10",
      valueColor: "text-[var(--income)]",
    },
    {
      title: "Expense",
      value: formatCurrency(summary.expense),
      icon: ArrowDownIcon,
      iconColor: "text-[var(--expense)]",
      iconBg: "bg-[var(--expense)]/10",
      valueColor: "text-[var(--expense)]",
    },
    {
      title: "Balance",
      value: formatCurrency(summary.balance),
      icon: Wallet,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      valueColor: summary.balance >= 0 ? "text-foreground" : "text-[var(--expense)]",
    },
    {
      title: "Savings Rate",
      value: `${summary.savingsRate.toFixed(1)}%`,
      icon: TrendingUp,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      valueColor: "text-foreground",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, iconColor, iconBg, valueColor }) => (
        <div
          key={title}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
              <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
            </div>
          </div>
          <p className={`text-xl font-bold tabular-nums tracking-tight ${valueColor}`}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
