"use client";

import { motion } from "framer-motion";
import { Zap, Brain, TrendingUp, Shield, Clock, Users } from "lucide-react";

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
  return (
    <section className="section-padding section-gradient-soft section-hr">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label mb-4"
          >
            Capabilities
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-headline mb-4"
          >
            Intelligence, engineered
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)]"
          >
            Every feature designed to give you an unfair advantage in spotting what's next.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
