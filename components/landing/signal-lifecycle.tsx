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
    <section className="py-12 md:py-28 section-bordered">
      <div className="container-wide">
        <motion.p
          initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          animate={isMobile ? { opacity: 1 } : undefined}
          viewport={{ once: true }}
          className="section-label text-center mb-3 md:mb-4"
        >
          Signal Intelligence
        </motion.p>
        <motion.h2
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={isMobile ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          className="font-serif text-2xl md:text-4xl text-center mb-4 md:mb-6"
        >
          Watch signals mature
        </motion.h2>
        <motion.p
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={isMobile ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={isMobile ? undefined : { delay: 0.1 }}
          className="text-center text-sm md:text-base text-[var(--foreground-muted)] mb-8 md:mb-16 max-w-lg mx-auto"
        >
          Spot the trajectory, not just the trend
        </motion.p>

        {/* Mobile: Compact horizontal lifecycle */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-2 mb-6">
            {stages.map((stage, i) => (
              <div key={stage.name} className="flex flex-col items-center relative">
                {/* Connection line */}
                {i < stages.length - 1 && (
                  <div className="absolute top-5 left-[50%] w-[calc(100%+20px)] h-px bg-[var(--border)]" />
                )}
                {/* Node */}
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-[var(--background)] relative z-10 mb-2"
                  style={{ borderColor: stage.color }}
                >
                  <span className="text-xs font-serif" style={{ color: stage.color }}>
                    {stage.signals}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-center">{stage.name}</span>
              </div>
            ))}
          </div>

          {/* Mobile example signal - condensed */}
          <div className="p-4 bg-[var(--background-elevated)] border border-[var(--border)] rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">AI Agent Frameworks</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                Growing
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--foreground-muted)]">
              <span>8mo ago</span>
              <span>•</span>
              <span>+340%</span>
              <span>•</span>
              <span>89% conf</span>
            </div>
          </div>
        </div>

        {/* Desktop: Full lifecycle visualization - unchanged */}
        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border)] -translate-y-1/2" />

            <div className="grid grid-cols-4 gap-4">
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
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-muted)]">
              <span>First detected: 8 months ago</span>
              <span>•</span>
              <span>340% growth</span>
              <span>•</span>
              <span>89% confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
