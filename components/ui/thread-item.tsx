"use client";

import { motion } from "framer-motion";

interface ThreadItemProps {
  children: React.ReactNode;
  className?: string;
  isLast?: boolean;
  animated?: boolean;
  delay?: number;
  nodeColor?: string;
}

export function ThreadItem({
  children,
  className = "",
  isLast = false,
  animated = true,
  delay = 0,
  nodeColor = "var(--accent-orange)",
}: ThreadItemProps) {
  const content = (
    <div
      className={`
        relative pl-8
        ${!isLast ? "pb-6" : ""}
        ${className}
      `}
    >
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-[3px] top-0 bottom-0 w-[1px]"
          style={{ background: "rgba(0, 0, 0, 0.1)" }}
        />
      )}

      {/* Horizontal branch */}
      <div
        className="absolute left-[3px] top-[14px] w-5 h-[1px]"
        style={{ background: "rgba(0, 0, 0, 0.1)" }}
      />

      {/* Node dot */}
      <div
        className="absolute left-0 top-[10px] w-[7px] h-[7px] rounded-full"
        style={{ background: nodeColor }}
      />

      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.5,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

interface ThreadListProps {
  children: React.ReactNode;
  className?: string;
}

export function ThreadList({ children, className = "" }: ThreadListProps) {
  return <div className={`relative ${className}`}>{children}</div>;
}
