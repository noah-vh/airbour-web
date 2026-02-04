"use client";

import { motion } from "framer-motion";

const metrics = [
  { value: "500+", label: "Sources" },
  { value: "12K", label: "Signals/mo" },
  { value: "15hr", label: "Saved weekly" },
  { value: "89%", label: "Accuracy" },
];

export function MetricsStrip() {
  return (
    <section className="py-12 section-warm">
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-serif text-4xl md:text-5xl text-[var(--foreground)] mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wide">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
