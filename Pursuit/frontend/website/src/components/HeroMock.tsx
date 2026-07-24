"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const rows = [
  { title: "Frontend Engineer", company: "Vercel", source: "linkedin", status: "interview" },
  { title: "Product Designer", company: "Notion", source: "indeed", status: "applied" },
  { title: "Design Systems Lead", company: "Stripe", source: "naukri", status: "offer" },
];

const sourceColor: Record<string, string> = {
  linkedin: "bg-linkedin",
  indeed: "bg-indeed",
  naukri: "bg-naukri",
};

const badgeStyle: Record<string, string> = {
  applied: "text-[#c9c4b8] bg-white/[0.06]",
  interview: "text-pending bg-pending/10",
  offer: "text-ok bg-ok/10",
};

export function HeroMock() {
  const [phase, setPhase] = useState<"scanning" | "detected" | "saved">("scanning");

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        setPhase("scanning");
        await new Promise((r) => setTimeout(r, 1600));
        setPhase("detected");
        await new Promise((r) => setTimeout(r, 1800));
        setPhase("saved");
        await new Promise((r) => setTimeout(r, 2200));
      }
    };
    sequence();
  }, []);

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <div className="absolute -inset-6 bg-accent/10 blur-3xl rounded-full" aria-hidden />

      <div className="relative rounded-2xl border border-line bg-bg-card overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* capture card, mirrors the actual extension popup */}
        <div className="relative p-5 border-b border-line-soft scan-line">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot shadow-[0_0_0_3px_rgba(247,96,10,0.12)]" />
            <span className="text-[9px] tracking-[1.2px] uppercase text-ink-dim">
              {phase === "scanning" && "scanning this page…"}
              {phase === "detected" && "detected on this page"}
              {phase === "saved" && "detected on this page"}
            </span>
          </div>

          <motion.div key={phase} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="font-display text-[19px] font-semibold leading-tight mb-0.5">
              Senior Product Designer
            </div>
            <div className="text-[11.5px] text-ink-dim">Linear · Remote</div>
          </motion.div>

          <motion.button
            animate={
              phase === "saved"
                ? { backgroundColor: "#7a9b6e" }
                : { backgroundColor: "#f7600a" }
            }
            transition={{ duration: 0.3 }}
            className="w-full mt-3.5 py-2.5 rounded-[9px] text-[12px] font-medium text-[#100a06] flex items-center justify-center gap-2"
          >
            {phase !== "saved" ? (
              <>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Save this application
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Saved to tracker
              </>
            )}
          </motion.button>
        </div>

        {/* recent list, matches dashboard styling */}
        <div className="p-4 flex flex-col gap-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="flex items-center justify-between px-3 py-2.5 rounded-[9px] border border-line-soft bg-bg"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${sourceColor[r.source]}`} />
                <div className="min-w-0">
                  <div className="text-[12px] truncate">{r.title}</div>
                  <div className="text-[10px] text-ink-faint">{r.company}</div>
                </div>
              </div>
              <span className={`text-[8.5px] uppercase tracking-wide px-2 py-1 rounded-full flex-shrink-0 ${badgeStyle[r.status]}`}>
                {r.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
