import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, PiggyBank, TrendingUp, Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-pattern" aria-hidden />
      <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-primary/10" aria-hidden />
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <PiggyBank className="h-4 w-4" />
          Simple budget tracking
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Take control of your{" "}
          <span className="bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            money
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
          Track income and expenses, see where you spend, and hit your savings goals—all in one place.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-2 px-8 text-base">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          {[
            { icon: Wallet, label: "Track spending" },
            { icon: TrendingUp, label: "See trends" },
            { icon: PiggyBank, label: "Save more" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
