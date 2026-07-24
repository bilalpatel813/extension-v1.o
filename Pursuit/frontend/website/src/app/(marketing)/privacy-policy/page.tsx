import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Privacy Policy",
  description: "How Pursuit collects, stores, and uses your data.",
};

const sections = [
  {
    title: "What Pursuit collects",
    body: [
      "The browser extension reads publicly visible job details on pages you open — job title, company name, location, and the page URL — only on LinkedIn, Indeed, and Naukri.",
      "When you create a Pursuit account, we store your full name and email address to identify your account, and a securely hashed version of your password. We never store your password in plain text.",
      "We do not read your resume, messages, emails, or any content on pages outside the three supported job sites.",
    ],
  },
  {
    title: "Where your data lives",
    body: [
      "Application data is stored locally in your browser first, so the extension keeps working even when you're offline or signed out.",
      "Once you're signed in, that same data is synced to your Pursuit account so it's available from the dashboard on any device.",
    ],
  },
  {
    title: "What we don't do",
    body: [
      "We don't sell your data to advertisers or data brokers, and we don't use your applications or profile information to train any model.",
      "We don't submit job applications on your behalf — Pursuit only observes and records what you've already done yourself on each site.",
    ],
  },
  {
    title: "Cookies and sessions",
    body: [
      "The dashboard uses a session to keep you signed in. This is used only for authentication — not for advertising or cross-site tracking.",
    ],
  },
  {
    title: "Your controls",
    body: [
      "You can edit your name and email at any time from your profile page.",
      "You can delete any tracked application individually from the dashboard.",
      "You can request full account and data deletion at any time by emailing us — see contact details below.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If this policy changes in a way that affects how your data is handled, we'll update this page and adjust the effective date below.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <Reveal>
        <span className="text-[10px] tracking-[1.6px] uppercase text-ink-faint">Legal</span>
        <h1 className="font-display text-[38px] sm:text-[46px] font-semibold mt-3 mb-3 leading-tight">
          Privacy policy
        </h1>
        <p className="text-[12.5px] text-ink-faint mb-14">Effective date: July 23, 2026</p>
      </Reveal>

      <div className="flex flex-col gap-12">
        {sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.04}>
            <h2 className="font-display text-[22px] font-semibold mb-3">{s.title}</h2>
            <div className="flex flex-col gap-3">
              {s.body.map((p, j) => (
                <p key={j} className="text-[13.5px] text-ink-dim leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        ))}

        <Reveal delay={0.3}>
          <div className="rounded-2xl border border-line-soft bg-bg-card p-6">
            <h2 className="font-display text-[22px] font-semibold mb-3">Questions</h2>
            <p className="text-[13.5px] text-ink-dim leading-relaxed">
              Reach out any time at{" "}
              <a href="mailto:patelbilal8137@gmail.com" className="text-accent hover:underline">
                patelbilal8137@gmail.com
              </a>{" "}
              for anything about how your data is handled.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
