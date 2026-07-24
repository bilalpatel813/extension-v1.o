"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar, MobileSidebar } from "@/components/Sidebar";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex items-center gap-2 text-ink-faint text-[12px]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileSidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile-only top bar: sidebar collapses into this below the md breakpoint */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-line-soft bg-bg/90 backdrop-blur-md themed-surface">
          <button
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-line-soft"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size={22} />
            <span className="font-display text-base font-semibold">Pursuit</span>
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
