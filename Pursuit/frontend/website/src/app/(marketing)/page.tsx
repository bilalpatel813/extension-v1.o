import Link from "next/link";
import { HeroMock } from "@/components/HeroMock";
import { Reveal } from "@/components/Reveal";
import { FeatureCard } from "@/components/FeatureCard";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const sources = [
  { name: "LinkedIn", dot: "bg-linkedin" },
  { name: "Indeed", dot: "bg-indeed" },
  { name: "Naukri", dot: "bg-naukri" },
];

const features = [
  {
    title: "Detects applications automatically",
    description:
      "A content script watches for the confirmation moment on each site — no copy-pasting job details into a spreadsheet ever again.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "One dashboard, every source",
    description:
      "LinkedIn, Indeed, and Naukri applications all land in the same place, tagged by source, so you stop juggling three tabs.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "A status pipeline that matches reality",
    description:
      "Move a role from Applied to Interview to Offer or Rejected in one click, and see your funnel at a glance from the stats up top.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    ),
  },
  {
    title: "Manual save, for anything auto-detect misses",
    description:
      "Sites change their layouts. When detection lags behind, one click in the popup saves whatever job you're looking at.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    title: "Search and filter without friction",
    description:
      "Find any application by role, company, or status in seconds — useful the moment you've applied to more than a handful of roles.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Your data, under your control",
    description:
      "Applications are stored locally first. Nothing is sold, shared, or used to train anything — see the privacy policy for specifics.",
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
  },
];

const installSteps = [
  {
    step: "01",
    title: "Download the extension",
    description: "Get the Pursuit extension package — Chrome Web Store listing is coming soon.",
  },
  {
    step: "02",
    title: "Open chrome://extensions",
    description: "Turn on Developer mode using the toggle in the top right corner.",
  },
  {
    step: "03",
    title: "Click \u201cLoad unpacked\u201d",
    description: "Select the unzipped Pursuit folder. The icon appears in your toolbar immediately.",
  },
  {
    step: "04",
    title: "Apply as usual",
    description: "Browse LinkedIn, Indeed, or Naukri like you normally would — Pursuit tracks quietly in the background.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pursuit",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Chrome",
  description:
    "Pursuit automatically tracks job applications submitted on LinkedIn, Indeed, and Naukri in one dashboard.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative ambient-glow overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Reveal>
              <span className="inline-block text-[10px] tracking-[1.6px] uppercase text-accent border border-line rounded-full px-3 py-1.5 mb-6">
                Free browser extension
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[44px] sm:text-[56px] font-semibold leading-[1.08] tracking-tight mb-6">
                Stop losing track of <span className="italic text-accent">where you applied.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[15px] text-ink-dim leading-relaxed max-w-md mb-9">
                Pursuit watches LinkedIn, Indeed, and Naukri as you apply, and logs every
                role automatically — title, company, and status — in one dashboard you
                actually want to open.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-full bg-accent text-[#100a06] text-[13px] font-medium hover:bg-accent-hover transition-colors"
                >
                  Get started free
                </Link>
                <Link
                  href="#install"
                  className="px-6 py-3 rounded-full border border-line-soft text-[13px] text-ink hover:border-line transition-colors"
                >
                  Install the extension
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex items-center gap-5 mt-10">
                <span className="text-[10px] tracking-[1.2px] uppercase text-ink-faint">Tracks applications on</span>
                <div className="flex items-center gap-4">
                  {sources.map((s) => (
                    <span key={s.name} className="flex items-center gap-1.5 text-[11.5px] text-ink-dim">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={28}>
            <HeroMock />
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-16">
        <Reveal>
          <div className="max-w-xl mb-14">
            <span className="text-[10px] tracking-[1.6px] uppercase text-ink-faint">Features</span>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold mt-3 leading-tight">
              Built for the actual chaos of a job search
            </h2>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Install guide */}
      <section id="install" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-16">
        <Reveal>
          <div className="max-w-xl mb-14">
            <span className="text-[10px] tracking-[1.6px] uppercase text-ink-faint">Installation</span>
            <h2 className="font-display text-[32px] sm:text-[38px] font-semibold mt-3 leading-tight">
              Live in under a minute
            </h2>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {installSteps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.07}>
              <div className="p-6 rounded-2xl border border-line-soft bg-bg-card h-full">
                <div className="font-display text-[30px] font-semibold text-accent/70 mb-4">{s.step}</div>
                <h3 className="text-[14px] font-medium mb-2">{s.title}</h3>
                <p className="text-[12.5px] text-ink-dim leading-relaxed">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="relative rounded-3xl border border-line bg-bg-card overflow-hidden px-8 py-14 sm:px-16 text-center ambient-glow">
            <h2 className="font-display text-[30px] sm:text-[38px] font-semibold mb-4 leading-tight">
              Your next offer starts with staying organized.
            </h2>
            <p className="text-[13.5px] text-ink-dim max-w-md mx-auto mb-8">
              Create a free account, install the extension, and let Pursuit handle the bookkeeping.
            </p>
            <Link
              href="/signup"
              className="inline-block px-7 py-3.5 rounded-full bg-accent text-[#100a06] text-[13px] font-medium hover:bg-accent-hover transition-colors"
            >
              Create your account
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
