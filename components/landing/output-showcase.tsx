"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Twitter, Linkedin, FileText, ArrowRight } from "lucide-react";

const outputs = [
  { id: "newsletter", icon: Mail, label: "Newsletter", description: "Weekly intelligence briefs" },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", description: "Thought leadership posts" },
  { id: "twitter", icon: Twitter, label: "Twitter", description: "Concise signal updates" },
  { id: "brief", icon: FileText, label: "Executive Brief", description: "Board-ready reports" },
] as const;

type OutputType = typeof outputs[number]["id"];

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

export function OutputShowcase() {
  const [active, setActive] = useState<OutputType>("newsletter");
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  // Auto-cycle tabs on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActive(current => {
        const currentIndex = outputs.findIndex(o => o.id === current);
        return outputs[(currentIndex + 1) % outputs.length].id;
      });
    }, 4000); // 4 seconds per tab

    return () => clearInterval(interval);
  }, [isMobile]);

  // Scroll-based tab switching with smoother progression - only on desktop
  useEffect(() => {
    // Disable scroll-based tab switching on mobile
    if (isMobile) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionHeight = rect.height;

      // Calculate progress through section
      const enterPoint = viewportHeight * 0.8;
      const exitPoint = -sectionHeight * 0.3;
      const totalRange = enterPoint - exitPoint;
      const currentPosition = enterPoint - rect.top;
      const progress = Math.max(0, Math.min(1, currentPosition / totalRange));

      if (progress > 0 && progress < 1) {
        const tabIndex = Math.min(
          Math.floor(progress * outputs.length),
          outputs.length - 1
        );
        setActive(outputs[tabIndex].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <section className="section-padding section-cool section-hr" ref={sectionRef}>
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.p
            initial={isMobile ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            animate={isMobile ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="section-label mb-4"
          >
            Output
          </motion.p>
          <motion.h2
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="font-serif text-headline mb-4"
          >
            Insight becomes influence
          </motion.h2>
          <motion.p
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { delay: 0.1 }}
            className="text-[var(--foreground-muted)]"
          >
            Your intelligence, every format
          </motion.p>
        </div>

        {/* Mobile: Horizontal scrolling tabs + stacked preview */}
        {/* Desktop: Split layout with sidebar */}
        <div className="max-w-5xl mx-auto">
          {/* Mobile: Auto-cycling with visible tabs and swipe */}
          <div className="lg:hidden">
            {/* Visible tab bar */}
            <div className="flex items-center gap-1 mb-3">
              {outputs.map((output) => {
                const isActive = active === output.id;
                return (
                  <button
                    key={output.id}
                    onClick={() => setActive(output.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[var(--accent-blue)] text-white"
                        : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] border border-[var(--border)]"
                    }`}
                  >
                    <output.icon className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">{output.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Swipeable content card */}
            <motion.div
              className="bg-[var(--background-elevated)] rounded-xl border border-[var(--border)] overflow-hidden touch-pan-y"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50) {
                  const currentIndex = outputs.findIndex(o => o.id === active);
                  const prevIndex = currentIndex === 0 ? outputs.length - 1 : currentIndex - 1;
                  setActive(outputs[prevIndex].id);
                } else if (info.offset.x < -50) {
                  const currentIndex = outputs.findIndex(o => o.id === active);
                  const nextIndex = (currentIndex + 1) % outputs.length;
                  setActive(outputs[nextIndex].id);
                }
              }}
            >
              {/* Progress bar */}
              <div className="h-0.5 bg-black/[0.04] relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--accent-blue)]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 4, ease: "linear" }}
                  key={`progress-${active}`}
                />
              </div>

              {/* Content with card-stack transition */}
              <div className="p-4 relative overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, scale: 1.08, y: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{
                      opacity: 0,
                      scale: 0.88,
                      y: 20,
                      filter: "blur(6px)",
                      position: "absolute",
                      inset: 0,
                      padding: "1rem",
                      zIndex: 0
                    }}
                    transition={{
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{ zIndex: 1 }}
                  >
                    {active === "newsletter" && <NewsletterPreviewContent />}
                    {active === "linkedin" && <LinkedInPreviewContent />}
                    {active === "twitter" && <TwitterPreviewContent />}
                    {active === "brief" && <BriefPreviewContent />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Desktop Layout - unchanged */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            {/* Left: Format selector */}
            <motion.div
              initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              animate={isMobile ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true }}
              className="space-y-2"
            >
              {outputs.map((output) => {
                const isActive = active === output.id;
                return (
                  <button
                    key={output.id}
                    onClick={() => setActive(output.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative ${
                      isActive
                        ? "bg-[var(--background-elevated)] shadow-[var(--shadow-elevated)]"
                        : "hover:bg-[var(--background-elevated)]/50"
                    }`}
                  >
                    {/* Active indicator line */}
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-[var(--accent-blue)] rounded-full"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: isActive ? 32 : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-[var(--accent-blue)]/10"
                          : "bg-[var(--background-secondary)] group-hover:bg-[var(--accent-blue)]/5"
                      }`}>
                        <output.icon className={`h-5 w-5 transition-colors ${
                          isActive ? "text-[var(--accent-blue)]" : "text-[var(--foreground-muted)]"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium text-sm transition-colors ${
                          isActive ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
                        }`}>
                          {output.label}
                        </div>
                        <div className="text-xs text-[var(--foreground-muted)] truncate">
                          {output.description}
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 transition-all ${
                        isActive
                          ? "text-[var(--accent-blue)] translate-x-0 opacity-100"
                          : "text-[var(--foreground-muted)] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* Right: Content preview - Desktop */}
            <motion.div
              initial={isMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              animate={isMobile ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true }}
              className="relative min-h-[400px]"
            >
              <AnimatePresence mode="wait">
                {active === "newsletter" && <NewsletterPreview key="newsletter" />}
                {active === "linkedin" && <LinkedInPreview key="linkedin" />}
                {active === "twitter" && <TwitterPreview key="twitter" />}
                {active === "brief" && <BriefPreview key="brief" />}
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

const previewVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
  }
};

function NewsletterPreview() {
  return (
    <motion.div
      variants={previewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="float-card rounded-2xl overflow-hidden"
    >
      <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-blue)]/5 to-transparent">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-[var(--accent-blue)]" />
          <span className="font-medium">Weekly Intelligence Brief</span>
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">Generated from 847 signals this week</p>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <h4 className="font-serif text-lg mb-3">Top Signals This Week</h4>
          <ul className="space-y-2.5">
            {[
              "AI agent frameworks seeing 340% increase in GitHub activity",
              "Climate tech investments surge in Q1, led by carbon capture",
              "Enterprise LLM adoption accelerating beyond initial pilots"
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-start gap-2 text-sm text-[var(--foreground-secondary)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)] mt-2 flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="pt-4 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--foreground-muted)]">Personalized for your interests • AI & ML, Developer Tools</span>
        </div>
      </div>
    </motion.div>
  );
}

function LinkedInPreview() {
  return (
    <motion.div
      variants={previewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="float-card rounded-2xl p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20" />
        <div>
          <div className="font-medium text-sm">Your Name</div>
          <div className="text-xs text-[var(--foreground-muted)]">Innovation Leader • 2h</div>
        </div>
      </div>
      <div className="text-sm leading-relaxed mb-5 space-y-3">
        <p>The AI agent landscape is shifting fast. Here's what I'm watching:</p>
        <div className="space-y-1.5 pl-1">
          {[
            "GitHub activity up 340% QoQ",
            "3 major enterprise deployments this month",
            "New frameworks emerging weekly"
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-[var(--accent-blue)]">→</span>
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
        <p>The signal is clear: this is the year autonomous agents go mainstream.</p>
        <p className="text-[var(--foreground-muted)]">#AI #Innovation #FutureTech</p>
      </div>
      <div className="flex items-center gap-5 text-xs text-[var(--foreground-muted)] pt-4 border-t border-[var(--border)]">
        <span>👍 127</span>
        <span>💬 23 comments</span>
        <span>🔄 18 reposts</span>
      </div>
    </motion.div>
  );
}

function TwitterPreview() {
  return (
    <motion.div
      variants={previewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="float-card rounded-2xl p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--foreground)]/10 to-[var(--foreground)]/5" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm">You</span>
            <span className="text-[var(--foreground-muted)] text-sm">@yourhandle</span>
          </div>
        </div>
      </div>
      <div className="text-sm leading-relaxed mb-4 space-y-3">
        <p>Just spotted: AI agent frameworks up 340% on GitHub this quarter.</p>
        <p>This isn't hype—it's enterprise adoption going mainstream.</p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--accent-blue)]"
        >
          The teams tracking this signal early will have a 6-month head start.
        </motion.p>
      </div>
      <div className="flex items-center gap-6 text-xs text-[var(--foreground-muted)] pt-4 border-t border-[var(--border)]">
        <span>💬 47</span>
        <span>🔄 128</span>
        <span>❤️ 412</span>
      </div>
    </motion.div>
  );
}

function BriefPreview() {
  return (
    <motion.div
      variants={previewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="float-card rounded-2xl overflow-hidden"
    >
      <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-[var(--accent-purple)]/5 to-transparent">
        <span className="text-xs text-[var(--accent-purple)] uppercase tracking-wide font-medium">Executive Brief</span>
        <h4 className="font-serif text-lg mt-1">AI Agents Market Update</h4>
      </div>
      <div className="p-6 space-y-5 text-sm">
        <div>
          <div className="font-medium mb-1.5 text-xs uppercase tracking-wide text-[var(--foreground-muted)]">Key Finding</div>
          <p className="text-[var(--foreground-secondary)]">
            Autonomous AI agents are transitioning from experimental to production deployments across enterprise software.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 py-5 border-y border-[var(--border)]">
          {[
            { value: "340%", label: "GitHub growth" },
            { value: "89%", label: "Confidence" },
            { value: "High", label: "Priority" }
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-serif text-[var(--accent-blue)]">{metric.value}</div>
              <div className="text-xs text-[var(--foreground-muted)]">{metric.label}</div>
            </motion.div>
          ))}
        </div>
        <div>
          <div className="font-medium mb-1.5 text-xs uppercase tracking-wide text-[var(--foreground-muted)]">Recommendation</div>
          <p className="text-[var(--foreground-secondary)]">
            Prioritize evaluation of agent frameworks for internal tooling. Early movers gaining significant advantage.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Mobile content-only preview components
// ============================================

function NewsletterPreviewContent() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--foreground-muted)]">Top signals this week:</p>
      <ul className="space-y-2">
        {[
          "AI agents up 340% on GitHub",
          "Climate tech investments surge",
          "Enterprise LLM adoption accelerating"
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground-secondary)]">
            <span className="w-1 h-1 rounded-full bg-[var(--accent-blue)] mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkedInPreviewContent() {
  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20" />
        <div>
          <div className="font-medium text-sm">Your Name</div>
          <div className="text-xs text-[var(--foreground-muted)]">Innovation Leader</div>
        </div>
      </div>
      <p className="text-sm text-[var(--foreground-secondary)] mb-3">
        AI agents are going mainstream. Here's what I'm watching...
      </p>
      <div className="flex gap-4 text-xs text-[var(--foreground-muted)]">
        <span>👍 127</span>
        <span>💬 23</span>
        <span>🔄 18</span>
      </div>
    </>
  );
}

function TwitterPreviewContent() {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10" />
        <span className="font-medium text-sm">You</span>
        <span className="text-[var(--foreground-muted)] text-sm">@yourhandle</span>
      </div>
      <p className="text-sm mb-3">
        AI agent frameworks up 340% on GitHub. The teams tracking this early will have a 6-month head start.
      </p>
      <div className="flex gap-4 text-xs text-[var(--foreground-muted)]">
        <span>💬 47</span>
        <span>🔄 128</span>
        <span>❤️ 412</span>
      </div>
    </>
  );
}

function BriefPreviewContent() {
  return (
    <>
      <h4 className="font-serif text-base mb-3">AI Agents Market Update</h4>
      <div className="grid grid-cols-3 gap-3 py-3 border-y border-[var(--border)] mb-3">
        {[
          { value: "340%", label: "Growth" },
          { value: "89%", label: "Confidence" },
          { value: "High", label: "Priority" }
        ].map((metric, i) => (
          <div key={i} className="text-center">
            <div className="text-lg font-serif text-[var(--accent-blue)]">{metric.value}</div>
            <div className="text-[10px] text-[var(--foreground-muted)]">{metric.label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--foreground-secondary)]">
        Prioritize agent framework evaluation. Early movers gaining advantage.
      </p>
    </>
  );
}
