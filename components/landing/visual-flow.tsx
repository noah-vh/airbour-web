"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, Sparkles, FileText, ArrowRight } from "lucide-react";

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
  const isMobile = useIsMobile();

  return (
    <section className="section-padding section-bordered">
      <div className="container-wide">
        <motion.p
          initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          animate={isMobile ? { opacity: 1 } : undefined}
          viewport={{ once: true }}
          className="section-label text-center mb-4"
        >
          How It Works
        </motion.p>
        <motion.h2
          initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          animate={isMobile ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          className="font-serif text-headline text-center mb-16"
        >
          From noise to clarity
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              transition={isMobile ? undefined : { delay: i * 0.15, duration: 0.6 }}
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
      {sources.map((src) => (
        <div
          key={src}
          className="px-3 py-2 text-xs font-medium rounded-full border border-[var(--border)] bg-[var(--background)]"
        >
          {src}
        </div>
      ))}
      <div className="w-full text-center mt-4">
        <span className="text-2xl font-serif text-[var(--accent-blue)]">500+</span>
        <span className="text-xs text-[var(--foreground-muted)] block">sources</span>
      </div>
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
      {categories.map((cat) => (
        <div key={cat.name} className="flex items-center gap-2">
          <span className="text-xs w-16 text-[var(--foreground-muted)]">{cat.name}</span>
          <div className="flex-1 h-2 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-500"
              style={{ width: `${cat.pct}%`, opacity: 0.3 + (cat.pct / 100) * 0.7 }}
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
      {outputs.map((out) => (
        <div
          key={out.type}
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
        </div>
      ))}
    </div>
  );
}
