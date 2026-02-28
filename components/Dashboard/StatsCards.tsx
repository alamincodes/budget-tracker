import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, PiggyBank } from "lucide-react";
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
            </CardContent>
          </Card>
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
      title: "Total Income",
      value: formatCurrency(summary.income),
      icon: ArrowUpIcon,
      className: "text-[var(--income)]",
      iconBg: "bg-[var(--income)]/10",
    },
    {
      title: "Total Expense",
      value: formatCurrency(summary.expense),
      icon: ArrowDownIcon,
      className: "text-[var(--expense)]",
      iconBg: "bg-[var(--expense)]/10",
    },
    {
      title: "Balance",
      value: formatCurrency(summary.balance),
      icon: DollarSign,
      className: "bg-primary text-primary-foreground border-0 shadow-lg shadow-primary/20",
      iconBg: "bg-white/20",
      invert: true,
    },
    {
      title: "Savings Rate",
      value: `${summary.savingsRate.toFixed(1)}%`,
      icon: PiggyBank,
      className: "text-foreground",
      iconBg: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, icon: Icon, className, iconBg, invert }) => (
        <Card
          key={title}
          className={`overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${className}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">{title}</CardTitle>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tabular-nums ${invert ? "" : ""}`}>{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
