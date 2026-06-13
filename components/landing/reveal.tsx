"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

// A restrained scroll-reveal: a short fade + rise, once. No bounce, no scale —
// just enough to make sections settle in as you scroll, the way Linear's site
// does. `delay` lets adjacent items stagger by a hair.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98], delay }}
    >
      {children}
    </motion.div>
  );
}
