"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Brain, TrendingUp, Shield, Clock, Users } from "lucide-react";

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

const features = [
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Signals are detected, classified, and scored within minutes of appearing. No more stale intelligence.",
    stat: "< 5 min",
    statLabel: "latency"
  },
  {
    icon: Brain,
    title: "STEEP Classification",
    description: "Every signal is automatically categorized across Social, Technological, Economic, Environmental, and Political dimensions.",
    stat: "5",
    statLabel: "categories"
  },
  {
    icon: TrendingUp,
    title: "Lifecycle Tracking",
    description: "Watch signals evolve from weak whispers to mainstream consensus. Know exactly when to act.",
    stat: "4",
    statLabel: "stages"
  },
  {
    icon: Shield,
    title: "Confidence Scoring",
    description: "AI-powered confidence scores help you prioritize what matters. Filter noise, focus on signal.",
    stat: "89%",
    statLabel: "accuracy"
  },
  {
    icon: Clock,
    title: "Automated Briefs",
    description: "Weekly intelligence reports generated automatically. Executive summaries, trend analysis, and recommendations.",
    stat: "15hr",
    statLabel: "saved/week"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share signals, annotate insights, and align your team around emerging opportunities.",
    stat: "∞",
    statLabel: "teammates"
  },
];

export function FeaturesSection() {
  const isMobile = useIsMobile();

  return (
    <section className="py-12 md:py-20 section-gradient-soft section-hr">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 md:mb-16">
          <motion.p
            initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            animate={isMobile ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="section-label mb-3 md:mb-4"
          >
            Capabilities
          </motion.p>
          <motion.h2
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="font-serif text-2xl md:text-4xl mb-3 md:mb-4"
          >
            Intelligence, engineered
          </motion.h2>
          <motion.p
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { delay: 0.1 }}
            className="text-sm md:text-base text-[var(--foreground-secondary)]"
          >
            Every feature designed to give you an unfair advantage.
          </motion.p>
        </div>

        {/* Mobile: Clean list layout */}
        <div className="md:hidden space-y-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--background-elevated)] border border-[var(--border)]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="h-5 w-5 text-[var(--accent-blue)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <span className="text-sm font-serif text-[var(--accent-blue)]">{feature.stat}</span>
                </div>
                <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Full grid - unchanged */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-[var(--background-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-lifted)] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-blue)]/10 flex items-center justify-center group-hover:bg-[var(--accent-blue)]/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-[var(--accent-blue)]" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-serif text-[var(--accent-blue)]">{feature.stat}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">{feature.statLabel}</div>
                </div>
              </div>

              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
