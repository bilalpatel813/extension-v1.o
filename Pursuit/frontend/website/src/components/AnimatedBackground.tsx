"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBackground({
  variant = "default",
  fixed = false,
}: {
  /** "subtle" halves the opacity — used behind data-dense pages like the dashboard. */
  variant?: "default" | "subtle";
  /** Fixed = stays put behind scrolling content, spans the whole viewport. */
  fixed?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const opacityScale = variant === "subtle" ? 0.55 : 1;

  const blobs = [
    { size: 460, top: "-12%", left: "58%", duration: 26, opacity: 0.14 },
    { size: 360, top: "30%", left: "-8%", duration: 32, opacity: 0.1 },
    { size: 300, top: "60%", left: "68%", duration: 22, opacity: 0.09 },
  ];

  return (
    <div
      className={`${fixed ? "fixed" : "absolute"} inset-0 overflow-hidden pointer-events-none`}
      aria-hidden
    >
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-accent blur-3xl"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            opacity: b.opacity * opacityScale,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 40, -20, 0],
                  y: [0, -30, 20, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
