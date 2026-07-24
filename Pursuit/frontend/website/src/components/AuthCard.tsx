import Link from "next/link";
import { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ambient-glow">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-display text-xl font-semibold">Pursuit</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <h1 className="font-display text-[30px] font-semibold mb-2">{title}</h1>
            <p className="text-[13px] text-ink-dim">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-line bg-bg-card p-7">{children}</div>

          <p className="text-center text-[12.5px] text-ink-dim mt-6">{footer}</p>
        </div>
      </div>
    </div>
  );
}
