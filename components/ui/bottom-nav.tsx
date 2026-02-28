"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Home, LayoutGrid, LogOut, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    setLogoutPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/dashboard/categories", icon: LayoutGrid, label: "Categories" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card sm:hidden">
        <div className="flex h-16 items-stretch">
          {/* Nav links */}
          {navLinks.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "stroke-[2.5]" : "stroke-[1.75]"
                  )}
                />
                <span>{label}</span>
              </Link>
            );
          })}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 stroke-[1.75]" />
              ) : (
                <Moon className="h-5 w-5 stroke-[1.75]" />
              )}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 stroke-[1.75]" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

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
