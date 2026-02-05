"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Check if we're on mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

const stages = [
  {
    name: "Weak",
    description: "First detected",
    signals: 12,
    color: "var(--foreground-muted)",
  },
  {
    name: "Emerging",
    description: "Gaining traction",
    signals: 34,
    color: "var(--accent-purple)",
  },
  {
    name: "Growing",
    description: "Accelerating",
    signals: 89,
    color: "var(--accent-blue)",
  },
  {
    name: "Mainstream",
    description: "Widely adopted",
    signals: 156,
    color: "var(--accent-green)",
  },
];

export function SignalLifecycle() {
  const isMobile = useIsMobile();

  return (
    <section className="py-20 md:py-28 section-bordered">
      <div className="container-wide">
        <motion.p
          initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          animate={isMobile ? { opacity: 1 } : undefined}
          viewport={{ once: true }}
          className="section-label text-center mb-4"
        >
          Signal Intelligence
        </motion.p>
        <motion.h2
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={isMobile ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          className="font-serif text-headline text-center mb-6"
        >
          Watch signals mature
        </motion.h2>
        <motion.p
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={isMobile ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={isMobile ? undefined : { delay: 0.1 }}
          className="text-center text-[var(--foreground-muted)] mb-16 max-w-lg mx-auto"
        >
          Spot the trajectory, not just the trend
        </motion.p>

        {/* Lifecycle visualization */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border)] -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {stages.map((stage) => (
                <div
                  key={stage.name}
                  className="relative text-center"
                >
                  {/* Node */}
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full border-2 flex items-center justify-center bg-[var(--background)] relative z-10"
                    style={{ borderColor: stage.color }}
                  >
                    <span className="text-lg font-serif" style={{ color: stage.color }}>
                      {stage.signals}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="font-medium mb-1">{stage.name}</h3>
                  <p className="text-xs text-[var(--foreground-muted)]">{stage.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Example signal */}
          <div className="mt-12 p-6 card-elevated rounded-xl max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">AI Agent Frameworks</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                Growing
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-[var(--foreground-muted)]">
              <span>First detected: 8 months ago</span>
              <span className="hidden md:inline">•</span>
              <span>340% growth</span>
              <span className="hidden md:inline">•</span>
              <span>89% confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
