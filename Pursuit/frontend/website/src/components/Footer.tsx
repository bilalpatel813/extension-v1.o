import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { Reveal } from "./Reveal";

const productLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#install", label: "Install extension" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/signup", label: "Create account" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/login", label: "Log in" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line-soft mt-24">
      <div className="absolute inset-0 bg-gradient-to-t from-accent-dim/40 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <BrandMark size={28} />
                <span className="font-display text-xl font-semibold">Pursuit</span>
              </div>
              <p className="text-[12.5px] text-ink-dim leading-relaxed max-w-xs">
                Every application you send on LinkedIn, Indeed, and Naukri — tracked
                automatically, in one calm dashboard.
              </p>
            </div>

            <div>
              <div className="text-[9.5px] tracking-[1.4px] uppercase text-ink-faint mb-4">Product</div>
              <ul className="flex flex-col gap-3">
                {productLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[12.5px] text-ink-dim hover:text-accent transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[9.5px] tracking-[1.4px] uppercase text-ink-faint mb-4">Legal</div>
              <ul className="flex flex-col gap-3">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[12.5px] text-ink-dim hover:text-accent transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-[9.5px] tracking-[1.4px] uppercase text-ink-faint mb-4">Contact</div>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href="mailto:patelbilal8137@gmail.com"
                    className="text-[12.5px] text-ink-dim hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-shrink-0 group-hover:stroke-accent">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                    patelbilal8137@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/bilalpatel813"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-ink-dim hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="flex-shrink-0 group-hover:fill-accent">
                      <path d="M12 .5C5.7.5.7 5.6.7 12c0 5.1 3.3 9.4 7.9 11 .6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2.1.1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.6 7.9-5.9 7.9-11C23.3 5.6 18.3.5 12 .5Z" />
                    </svg>
                    github.com/bilalpatel813
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-14 pt-8 border-t border-line-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-ink-faint">
            © {new Date().getFullYear()} Pursuit. Built by Bilal Patel.
          </p>
          <p className="text-[11px] text-ink-faint">
            Not affiliated with LinkedIn, Indeed, or Naukri.
          </p>
        </div>
      </div>
    </footer>
  );
}
