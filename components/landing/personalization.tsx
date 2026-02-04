"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const interests = [
  { label: "AI & Machine Learning", value: 92 },
  { label: "Developer Tools", value: 85 },
  { label: "Climate Technology", value: 78 },
  { label: "Enterprise SaaS", value: 64 },
];

export function Personalization() {
  return (
    <section className="section-padding section-dark-tint section-bordered">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
                {interests.map((interest, i) => (
                  <div key={interest.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm">{interest.label}</span>
                      <span className="text-sm text-[var(--foreground-muted)]">{interest.value}%</span>
                    </div>
                    <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${interest.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                        className="h-full bg-[var(--accent-purple)] rounded-full"
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
