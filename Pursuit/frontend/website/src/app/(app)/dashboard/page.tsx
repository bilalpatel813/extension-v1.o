"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import type { JobApplication, JobStatus } from "@/lib/api";

const filters: { key: JobStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

const sourceDot: Record<string, string> = {
  linkedin: "bg-linkedin",
  indeed: "bg-indeed",
  naukri: "bg-naukri",
  manual: "bg-ink-faint",
};

const statusStyle: Record<JobStatus, string> = {
  applied: "text-[#c9c4b8] border-line-soft",
  interview: "text-pending border-pending/30",
  offer: "text-ok border-ok/30",
  rejected: "text-rejected border-rejected/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<JobStatus | "all">("all");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    api
      .getApplications()
      .then((data) => setApps(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load applications."))
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    return apps
      .filter((a) => activeFilter === "all" || a.status === activeFilter)
      .filter((a) => {
        if (!search) return true;
        const hay = `${a.title} ${a.company}`.toLowerCase();
        return hay.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [apps, activeFilter, search]);

  const stats = useMemo(
    () => ({
      total: apps.length,
      interview: apps.filter((a) => a.status === "interview").length,
      offer: apps.filter((a) => a.status === "offer").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    }),
    [apps]
  );

  async function handleStatusChange(id: string, status: JobStatus) {
    if (!user) return;
    const previous = apps;
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      await api.updateApplicationStatus(id, status);
    } catch (err) {
      setApps(previous);
      setLoadError(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    const previous = apps;
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.deleteApplication(id);
    } catch (err) {
      setApps(previous);
      setLoadError(err instanceof Error ? err.message : "Failed to delete application.");
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-[32px] font-semibold mb-1">
          Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-[13px] text-ink-dim mb-8">Here&rsquo;s everything you&rsquo;ve applied to.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Total applied", value: stats.total, color: "text-ink" },
          { label: "Interview", value: stats.interview, color: "text-pending" },
          { label: "Offers", value: stats.offer, color: "text-ok" },
          { label: "Rejected", value: stats.rejected, color: "text-rejected" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line-soft bg-bg-card p-5">
            <div className={`font-display text-[30px] font-semibold leading-none ${s.color}`}>{s.value}</div>
            <div className="text-[9.5px] tracking-[1.1px] uppercase text-ink-faint mt-2">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2.5 rounded-[10px] border border-line-soft bg-bg-card px-4 py-2.5">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-faint flex-shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role or company…"
            className="w-full bg-transparent outline-none text-[12.5px] placeholder:text-ink-faint"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3.5 py-2 rounded-lg text-[10.5px] tracking-wide uppercase whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? "bg-accent text-[#100a06] font-medium"
                  : "border border-line-soft text-ink-dim hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && <p className="text-[12px] text-rejected mb-4">{loadError}</p>}

      <div className="rounded-2xl border border-line-soft bg-bg-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[12.5px] text-ink-faint">Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div className="p-14 text-center">
            <p className="font-display text-[19px] italic mb-1.5">Nothing here yet.</p>
            <p className="text-[12px] text-ink-faint">
              Apply to a role on LinkedIn, Indeed, or Naukri and it&rsquo;ll show up automatically.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-line-soft last:border-b-0"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${sourceDot[a.source]}`} />
                  <div className="min-w-0">
                    <div className="text-[13px] truncate">{a.title}</div>
                    <div className="text-[11px] text-ink-faint truncate">
                      {a.company}
                      {a.location ? ` · ${a.location}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <div className="text-[11px] text-ink-faint w-28 flex-shrink-0">{formatDate(a.appliedAt)}</div>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a.id, e.target.value as JobStatus)}
                    className={`text-[10.5px] uppercase tracking-wide px-3 py-1.5 rounded-full bg-transparent border cursor-pointer flex-shrink-0 ${statusStyle[a.status]}`}
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label="Delete application"
                    className="w-8 h-8 flex-shrink-0 rounded-lg border border-line-soft flex items-center justify-center hover:border-rejected/50 hover:bg-rejected/10 transition-colors group"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-faint group-hover:text-rejected">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
