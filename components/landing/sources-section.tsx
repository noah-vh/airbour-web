"use client";

import { motion } from "framer-motion";
import { Github, MessageSquare, Newspaper, FileText, Rss, Globe, Beaker, BookOpen } from "lucide-react";

const sourceCategories = [
  {
    label: "Developer",
    sources: [
      { name: "GitHub", icon: Github, count: "1.2M+" },
      { name: "Hacker News", icon: MessageSquare, count: "50K+" },
      { name: "Stack Overflow", icon: MessageSquare, count: "100K+" },
    ]
  },
  {
    label: "Social",
    sources: [
      { name: "Reddit", icon: MessageSquare, count: "200K+" },
      { name: "Twitter/X", icon: MessageSquare, count: "500K+" },
      { name: "LinkedIn", icon: Globe, count: "150K+" },
    ]
  },
  {
    label: "Research",
    sources: [
      { name: "ArXiv", icon: BookOpen, count: "80K+" },
      { name: "Patents", icon: FileText, count: "45K+" },
      { name: "Academic", icon: Beaker, count: "60K+" },
    ]
  },
  {
    label: "News & Media",
    sources: [
      { name: "TechCrunch", icon: Newspaper, count: "25K+" },
      { name: "News APIs", icon: Globe, count: "300K+" },
      { name: "RSS Feeds", icon: Rss, count: "Custom" },
    ]
  },
];

export function SourcesSection() {
  return (
    <section className="section-padding section-warm section-hr">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label mb-4"
          >
            Data Sources
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-headline mb-4"
          >
            Everywhere that matters
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[var(--foreground-secondary)]"
          >
            We monitor 500+ sources across the entire innovation landscape—so you never miss a signal.
          </motion.p>
        </div>

        {/* Sources grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {sourceCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground-muted)] mb-4">
                {category.label}
              </h3>

              {category.sources.map((source, sourceIndex) => (
                <motion.div
                  key={source.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: categoryIndex * 0.1 + sourceIndex * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center group-hover:bg-[var(--accent-blue)]/10 transition-colors">
                    <source.icon className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-[var(--accent-blue)] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{source.name}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{source.count} signals</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] opacity-60" />
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-[var(--foreground-muted)]">
            Plus custom RSS feeds, webhooks, and API integrations
          </p>
        </motion.div>
      </div>
    </section>
  );
}
