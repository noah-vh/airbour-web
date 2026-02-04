"use client";

import { motion } from "framer-motion";
import { Radio, Sparkles, FileText, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Radio,
    label: "Gather",
    tagline: "LIVE MONITORING",
    description: "500+ sources watched in real-time",
    visual: <GatherVisual />,
  },
  {
    icon: Sparkles,
    label: "Analyze",
    tagline: "AI CLASSIFICATION",
    description: "Signals scored and categorized automatically",
    visual: <AnalyzeVisual />,
  },
  {
    icon: FileText,
    label: "Deliver",
    tagline: "SMART OUTPUT",
    description: "Newsletters, briefs, and social content",
    visual: <DeliverVisual />,
  },
];

export function VisualFlow() {
  return (
    <section className="section-padding section-bordered">
      <div className="container-wide">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-label text-center mb-4"
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-headline text-center mb-16"
        >
          From noise to clarity
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative"
            >
              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
              )}

              <div className="float-card p-6 h-full">
                {/* Feature label */}
                <span className="feature-label">{step.tagline}</span>

                {/* Header */}
                <h3 className="font-serif text-xl mb-2">{step.label}</h3>
                <p className="text-sm text-[var(--foreground-muted)] mb-5">{step.description}</p>

                {/* Visual */}
                <div className="rounded-xl bg-[var(--background-secondary)] p-4 min-h-[160px]">
                  {step.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GatherVisual() {
  const sources = ["GitHub", "HN", "Reddit", "News", "RSS", "Custom"];
  return (
    <div className="flex flex-wrap gap-2 justify-center items-center h-full">
      {sources.map((src, i) => (
        <motion.div
          key={src}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
          className="px-3 py-2 text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--background)]"
        >
          {src}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="w-full text-center mt-4"
      >
        <span className="text-2xl font-serif text-[var(--accent-blue)]">500+</span>
        <span className="text-xs text-[var(--foreground-muted)] block">sources</span>
      </motion.div>
    </div>
  );
}

function AnalyzeVisual() {
  const categories = [
    { name: "Tech", pct: 45 },
    { name: "Economic", pct: 25 },
    { name: "Social", pct: 15 },
    { name: "Political", pct: 10 },
    { name: "Env", pct: 5 },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-3 w-3 text-[var(--accent-blue)]" />
        <span className="text-xs text-[var(--foreground-muted)]">STEEP Classification</span>
      </div>
      {categories.map((cat, i) => (
        <div key={cat.name} className="flex items-center gap-2">
          <span className="text-xs w-16 text-[var(--foreground-muted)]">{cat.name}</span>
          <div className="flex-1 h-2 bg-[var(--background)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${cat.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
              className="h-full bg-[var(--accent-blue)] rounded-full"
              style={{ opacity: 0.3 + (cat.pct / 100) * 0.7 }}
            />
          </div>
          <span className="text-xs w-8 text-right">{cat.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function DeliverVisual() {
  const outputs = [
    { type: "Newsletter", status: "ready" },
    { type: "LinkedIn", status: "ready" },
    { type: "Brief", status: "generating" },
  ];
  return (
    <div className="space-y-3">
      {outputs.map((out, i) => (
        <motion.div
          key={out.type}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.15 }}
          className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]"
        >
          <span className="text-sm font-medium">{out.type}</span>
          {out.status === "ready" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">Ready</span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] animate-pulse" />
              Generating
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
