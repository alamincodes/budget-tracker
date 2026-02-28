"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  LayoutGrid,
  LogOut,
  Moon,
  Sun,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppMenu() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    setLogoutPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/categories", icon: LayoutGrid, label: "Categories" },
  ];

  return (
    <>
      {/* Desktop floating button — hidden on mobile */}
      <div className="hidden sm:block fixed top-3 right-3 z-50">
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Wallet className="h-4 w-4" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-52 rounded-2xl border border-border p-1.5"
          >
            {/* Nav links */}
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                  pathname === href
                    ? "text-primary font-semibold"
                    : "text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}

            <div className="my-1 border-t border-border" />

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 shrink-0" />
                ) : (
                  <Moon className="h-4 w-4 shrink-0" />
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            )}

            <div className="my-1 border-t border-border" />

            {/* Logout */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setLogoutOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign out
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Logout confirm modal */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        isPending={logoutPending}
        title="Sign out?"
        description="You'll be signed out of your account."
        confirmLabel="Sign out"
      />
    </>
  );
}
