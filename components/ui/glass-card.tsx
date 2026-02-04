"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = "", animated = true, hover = true, delay = 0, onClick, style }, ref) => {
    const baseClasses = `
      bg-white/60 backdrop-blur-[1px]
      border border-black/[0.08]
      rounded-md
      transition-all duration-300
      ${hover ? "hover:border-black/[0.12] hover:bg-white/80" : ""}
      ${className}
    `;

    if (animated) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={baseClasses}
          onClick={onClick}
          style={style}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClasses} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
