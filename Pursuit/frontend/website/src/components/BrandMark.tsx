export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-[8px] bg-gradient-to-br from-accent to-[#b8460a] shadow-[0_4px_14px_rgba(247,96,10,0.35)] flex items-center justify-center flex-shrink-0"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0d0d0d"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    </div>
  );
}
