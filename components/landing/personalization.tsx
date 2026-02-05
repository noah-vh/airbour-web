"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

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

const interests = [
  { label: "AI & Machine Learning", value: 92 },
  { label: "Developer Tools", value: 85 },
  { label: "Climate Technology", value: 78 },
  { label: "Enterprise SaaS", value: 64 },
];

export function Personalization() {
  const isMobile = useIsMobile();

  return (
    <section className="section-padding section-dark-tint section-bordered">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            animate={isMobile ? { opacity: 1, x: 0 } : undefined}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { duration: 0.6 }}
          >
            <p className="section-label mb-4">Personalization</p>
            <h2 className="font-serif text-headline tracking-tight mb-4">
              It learns you
            </h2>
            <p className="text-[var(--foreground-secondary)]">
              Airbour adapts to your industry, your competitors, your blind spots.
              The more you use it, the sharper it gets.
            </p>
          </motion.div>

          {/* Right: Visual demo */}
          <motion.div
            initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            animate={isMobile ? { opacity: 1, x: 0 } : undefined}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { duration: 0.6, delay: 0.1 }}
          >
            <div className="card-elevated p-6 rounded-xl">
              {/* Profile header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-purple)]/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[var(--accent-purple)]" />
                </div>
                <div>
                  <div className="font-medium text-sm">Your Intelligence Profile</div>
                  <div className="text-xs text-[var(--foreground-muted)]">Continuously learning</div>
                </div>
              </div>

              {/* Interest bars */}
              <div className="space-y-4 mb-6">
                {interests.map((interest) => (
                  <div key={interest.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm">{interest.label}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">{interest.value}%</span>
                    </div>
                    <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent-purple)] rounded-full transition-all duration-500"
                        style={{ width: `${interest.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                Adapting from 1,247 interactions
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
