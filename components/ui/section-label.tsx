"use client";

import { motion } from "framer-motion";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function SectionLabel({ children, className = "", animated = true }: SectionLabelProps) {
  const content = (
    <span
      className={`inline-block text-xs font-medium tracking-[0.15em] uppercase text-[var(--foreground-muted)] ${className}`}
    >
      {children}
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
