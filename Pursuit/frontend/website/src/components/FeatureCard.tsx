import { ReactNode } from "react";

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-line-soft bg-bg-card hover:border-line transition-colors group">
      <div className="w-11 h-11 rounded-xl bg-accent-dim flex items-center justify-center mb-5 text-accent group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="font-display text-[20px] font-semibold mb-2">{title}</h3>
      <p className="text-[13px] text-ink-dim leading-relaxed">{description}</p>
    </div>
  );
}
