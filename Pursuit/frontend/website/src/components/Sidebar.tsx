"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
      </svg>
    ),
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <div className="p-5 border-b border-line-soft flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <BrandMark size={26} />
          <span className="font-display text-lg font-semibold">Pursuit</span>
        </Link>
        <ThemeToggle className="md:hidden" />
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] transition-colors ${
                active
                  ? "bg-accent-dim text-accent"
                  : "text-ink-dim hover:text-ink hover:bg-white/[0.03]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line-soft">
        <div className="hidden md:flex items-center justify-between px-2 py-2 mb-1">
          <span className="text-[9.5px] tracking-[1.2px] uppercase text-ink-faint">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center text-[11px] font-medium flex-shrink-0">
            {user?.fullName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] truncate">{user?.fullName}</div>
            <div className="text-[10px] text-ink-faint truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] text-ink-faint hover:text-rejected hover:bg-rejected/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
          Log out
        </button>
      </div>
    </>
  );
}

/** Static sidebar, always visible from the md breakpoint up. */
export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[220px] flex-shrink-0 border-r border-line-soft bg-bg-raised themed-surface flex-col h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}

/** Off-canvas drawer used below the md breakpoint. */
export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 w-[260px] max-w-[80vw] bg-bg-raised border-r border-line-soft z-50 flex flex-col md:hidden"
          >
            <SidebarContent onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
