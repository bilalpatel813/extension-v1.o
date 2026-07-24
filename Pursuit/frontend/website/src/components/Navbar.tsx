"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#install", label: "Install" },
  { href: "/privacy-policy", label: "Privacy" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-display text-xl font-semibold tracking-tight">Pursuit</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[12px] tracking-wide text-ink-dim hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link
              href="/dashboard"
              className="text-[12px] px-4 py-2 rounded-full bg-accent text-[#100a06] font-medium hover:bg-accent-hover transition-colors"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[12px] text-ink-dim hover:text-ink transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-[12px] px-4 py-2 rounded-full bg-accent text-[#100a06] font-medium hover:bg-accent-hover transition-colors"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-line-soft"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-line-soft"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-ink-dim" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              <div className="h-px bg-line-soft my-1" />
              {user ? (
                <Link href="/dashboard" className="text-sm text-accent" onClick={() => setOpen(false)}>
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-ink-dim" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                  <Link href="/signup" className="text-sm text-accent" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
