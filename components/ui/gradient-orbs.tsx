"use client";

import { motion } from "framer-motion";

export function GradientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[var(--accent-blue)] rounded-full opacity-[0.03] blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-2/3 -right-32 w-[500px] h-[500px] bg-[var(--accent-purple)] rounded-full opacity-[0.03] blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[var(--accent-green)] rounded-full opacity-[0.02] blur-[100px]"
      />
    </div>
  );
}
