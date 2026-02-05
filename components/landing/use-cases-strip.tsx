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

const audiences = [
  {
    role: "Innovation Leaders",
    challenge: "You're drowning in noise while competitors find signals first.",
    outcome: "Surface emerging trends 6 months before they hit mainstream radar.",
  },
  {
    role: "R&D Strategists",
    challenge: "Manual research can't keep pace with exponential change.",
    outcome: "Track 500+ sources automatically. Focus on strategy, not scrolling.",
  },
  {
    role: "Strategy Consultants",
    challenge: "Your clients expect insights you can defend with data.",
    outcome: "Deliver data-backed recommendations with confidence scores and citations.",
  },
  {
    role: "Venture Partners",
    challenge: "The best deals go to those who see market shifts earliest.",
    outcome: "Identify emerging technologies and market movements before the crowd.",
  },
];

export function UseCasesStrip() {
  const isMobile = useIsMobile();

  return (
    <section className="py-24 md:py-32 section-alt-2 section-hr">
      <div className="container-wide">
        <div className="max-w-5xl mx-auto">
          {/* Editorial header */}
          <div className="mb-16 md:mb-20">
            <motion.p
              initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              animate={isMobile ? { opacity: 1 } : undefined}
              viewport={{ once: true }}
              className="section-label mb-4"
            >
              Who It's For
            </motion.p>
            <motion.h2
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              transition={isMobile ? undefined : { delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl tracking-tight max-w-2xl"
            >
              Built for those who shape markets—
              <span className="text-[var(--foreground-secondary)]">not chase them</span>
            </motion.h2>
          </div>

          {/* Editorial audience grid */}
          <div className="space-y-0">
            {audiences.map((audience) => (
              <div
                key={audience.role}
                className="group grid md:grid-cols-[200px_1fr_1fr] gap-6 md:gap-10 py-8 md:py-10 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--background-elevated)]/30 -mx-6 px-6 transition-colors duration-300"
              >
                {/* Role */}
                <div className="flex items-start">
                  <h3 className="font-serif text-xl md:text-2xl text-[var(--foreground)] group-hover:text-[var(--accent-blue)] transition-colors">
                    {audience.role}
                  </h3>
                </div>

                {/* Challenge */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-2">
                    The Challenge
                  </p>
                  <p className="text-[var(--foreground-secondary)] leading-relaxed">
                    {audience.challenge}
                  </p>
                </div>

                {/* Outcome */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-2">
                    With Airbour
                  </p>
                  <p className="text-[var(--foreground)] leading-relaxed font-medium">
                    {audience.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
