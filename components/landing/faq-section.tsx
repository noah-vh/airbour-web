"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How does Airbour find signals?",
    answer: "We continuously monitor 500+ sources including GitHub, Hacker News, Reddit, ArXiv, news outlets, patent databases, and custom feeds. Our AI processes millions of data points daily to surface the signals that matter to your business."
  },
  {
    question: "What makes a 'signal' different from just news?",
    answer: "Signals are early indicators of emerging trends—not just news coverage. We detect patterns in developer activity, research publications, social discussions, and market movements before they become mainstream headlines. By the time something is 'news', the advantage is often gone."
  },
  {
    question: "How accurate is the AI classification?",
    answer: "Our AI models achieve 89% accuracy on signal classification and confidence scoring. We use a combination of Claude and Gemini models, continuously refined on real-world feedback. Every signal includes a confidence score so you can calibrate your decisions accordingly."
  },
  {
    question: "Can I customize what signals I track?",
    answer: "Absolutely. You can define custom topics, industries, competitors, and technologies to monitor. Airbour learns from your interactions—the signals you engage with, share, or dismiss—to continuously improve relevance for your specific context."
  },
  {
    question: "What content formats can Airbour generate?",
    answer: "We automatically generate weekly intelligence newsletters, LinkedIn thought leadership posts, Twitter/X threads, and executive briefs. All content is based on your tracked signals and customized to your voice and audience."
  },
  {
    question: "Is there a free trial?",
    answer: "We're currently in private beta. Join the waitlist to get early access and shape the product with your feedback. Early users will receive special pricing when we launch publicly."
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding section-bordered">
      <div className="container-wide">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-headline"
            >
              Common questions
            </motion.h2>
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "bg-[var(--background-elevated)] border-[var(--border-hover)] shadow-[var(--shadow-elevated)]"
                      : "bg-transparent border-[var(--border)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className={`font-medium pr-4 transition-colors ${
                      isOpen ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isOpen
                        ? "bg-[var(--accent-blue)] text-white"
                        : "bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                    }`}>
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <p className="text-[var(--foreground-secondary)] leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
