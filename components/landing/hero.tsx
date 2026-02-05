"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Radio,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { TabSlider } from "@/components/ui/tab-slider";

const tabs = ["signals", "sources", "ai"] as const;
type TabType = typeof tabs[number];

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

export function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("signals");
  const demoRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const createSubscriber = useMutation(api.subscribers.create);

  // Auto-cycle tabs on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = tabs.indexOf(current);
        return tabs[(currentIndex + 1) % tabs.length];
      });
    }, 4000); // 4 seconds per tab

    return () => clearInterval(interval);
  }, [isMobile]);

  // Scroll-based tab switching - only on desktop
  useEffect(() => {
    // Disable scroll-based tab switching on mobile
    if (isMobile) return;

    const handleScroll = () => {
      if (!demoRef.current) return;

      const rect = demoRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate how far through the section we've scrolled
      // Start switching when section enters viewport, complete when it exits
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Progress: 0 when section top hits viewport bottom, 1 when section bottom hits viewport top
      const scrollProgress = 1 - (sectionTop + sectionHeight) / (viewportHeight + sectionHeight);

      // Only switch tabs when section is in view
      if (scrollProgress >= 0 && scrollProgress <= 1) {
        const tabIndex = Math.min(
          Math.floor(scrollProgress * tabs.length),
          tabs.length - 1
        );
        setActiveTab(tabs[tabIndex]);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await createSubscriber({ email: email.trim(), source: "landing" });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong");
    }
  };

  // Animation variants - simplified on mobile
  const fadeInUp = isMobile
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  const fadeInUpDelayed = (delay: number) => isMobile
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: undefined }
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <>
      {/* Hero statement - premium editorial layout */}
      <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
        {/* Ambient glow - hidden on mobile for performance */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[var(--accent-blue)]/[0.03] rounded-full blur-[100px] pointer-events-none hidden md:block" />

        <div className="container-wide relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
              {/* Left: Statement */}
              <div>
                {/* Product name */}
                <motion.p
                  initial={fadeInUp.initial}
                  animate={fadeInUp.animate}
                  transition={isMobile ? undefined : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif text-3xl md:text-4xl text-[var(--foreground)] mb-4"
                >
                  Airbour
                </motion.p>

                {/* Main Headline */}
                <motion.h1
                  initial={fadeInUpDelayed(0.1).initial}
                  animate={fadeInUpDelayed(0.1).animate}
                  transition={fadeInUpDelayed(0.1).transition}
                  className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-6"
                >
                  <span className="inline-block">Know First.</span>{" "}
                  <span className="inline-block text-[var(--accent-blue)] whitespace-nowrap">Lead Always.</span>
                </motion.h1>

                <motion.p
                  initial={fadeInUpDelayed(0.2).initial}
                  animate={fadeInUpDelayed(0.2).animate}
                  transition={isMobile ? undefined : { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-xl md:text-2xl text-[var(--foreground-secondary)] leading-relaxed max-w-lg"
                >
                  AI that watches the world so you can shape it.
                </motion.p>
              </div>

              {/* Right: Signup form card */}
              <motion.div
                initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {status === "success" ? (
                  <div className="p-8 md:p-10 bg-[var(--background-elevated)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-elevated)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent-green)]/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-[var(--accent-green)]" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">You're on the list</p>
                        <p className="text-sm text-[var(--foreground-muted)]">We'll be in touch soon</p>
                      </div>
                    </div>
                    <p className="text-[var(--foreground-secondary)] text-sm leading-relaxed">
                      Thank you for your interest. We're onboarding early users in batches—you'll hear from us when it's your turn.
                    </p>
                  </div>
                ) : (
                  <div className="p-8 md:p-10 bg-[var(--background-elevated)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-elevated)]">
                    <div className="mb-6">
                      <h2 className="font-serif text-2xl mb-2">Join the waitlist</h2>
                      <p className="text-[var(--foreground-secondary)] text-sm">
                        Early access to AI-powered market intelligence.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-[var(--foreground-secondary)] mb-2">
                          Work email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                          placeholder="you@company.com"
                          className="w-full px-5 py-4 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl text-base focus:outline-none focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue)]/10 focus:bg-[var(--background)] transition-all"
                          disabled={status === "loading"}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] px-6 py-4 rounded-xl font-medium text-base transition-all"
                      >
                        {status === "loading" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          "Request Early Access"
                        )}
                      </button>

                      {status === "error" && (
                        <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                    </form>

                    {/* Social proof hint */}
                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-[var(--border)] text-[var(--foreground-muted)] text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                        Limited beta
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[var(--border-hover)]" />
                      <span>No credit card</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo - split layout */}
      <section className="pb-16 md:pb-32" ref={demoRef}>
        <div className="container-wide">
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            transition={isMobile ? undefined : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            {/* Mobile: Auto-cycling demo with visible tabs and swipe */}
            <div className="lg:hidden">
              {/* Visible tab bar */}
              <div className="flex items-center gap-1 mb-3">
                {[
                  { id: "signals" as const, icon: BarChart3, label: "Signals" },
                  { id: "sources" as const, icon: Radio, label: "Sources" },
                  { id: "ai" as const, icon: Sparkles, label: "AI" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[var(--accent-blue)] text-white"
                          : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] border border-[var(--border)]"
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Swipeable content card */}
              <motion.div
                className="float-card rounded-xl overflow-hidden touch-pan-y"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) {
                    const currentIndex = tabs.indexOf(activeTab);
                    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
                    setActiveTab(tabs[prevIndex]);
                  } else if (info.offset.x < -50) {
                    const currentIndex = tabs.indexOf(activeTab);
                    const nextIndex = (currentIndex + 1) % tabs.length;
                    setActiveTab(tabs[nextIndex]);
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
                    key={`progress-${activeTab}`}
                  />
                </div>

                {/* Content with smooth layout + crossfade */}
                <motion.div
                  layout
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 }
                  }}
                  className="relative"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        opacity: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                      }}
                    >
                      {activeTab === "signals" && <SignalsDemoMobile />}
                      {activeTab === "sources" && <SourcesDemoMobile />}
                      {activeTab === "ai" && <AIDemoMobile />}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>

            {/* Desktop: Split layout - unchanged */}
            <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-12">
              {/* Left: Feature selector with narrative */}
              <div className="space-y-3">
                {[
                  {
                    id: "signals" as const,
                    icon: BarChart3,
                    label: "Live Signals",
                    tagline: "REAL-TIME TRACKING",
                    description: "Surface emerging trends before they hit mainstream. Track signals from weak to mainstream with confidence scoring."
                  },
                  {
                    id: "sources" as const,
                    icon: Radio,
                    label: "500+ Sources",
                    tagline: "COMPREHENSIVE COVERAGE",
                    description: "GitHub, Hacker News, Reddit, ArXiv, news feeds, and custom sources—all synthesized into one stream."
                  },
                  {
                    id: "ai" as const,
                    icon: Sparkles,
                    label: "AI Analysis",
                    tagline: "INTELLIGENT PROCESSING",
                    description: "Claude and Gemini classify, score, and contextualize every signal. You get insight, not noise."
                  },
                ].map((feature) => {
                  const isActive = activeTab === feature.id;
                  return (
                    <button
                      key={feature.id}
                      onClick={() => setActiveTab(feature.id)}
                      className={`w-full text-left p-5 rounded-xl transition-all duration-300 group relative ${
                        isActive
                          ? "bg-[var(--background-elevated)] shadow-[var(--shadow-elevated)]"
                          : "hover:bg-[var(--background-elevated)]/50"
                      }`}
                    >
                      {/* Active indicator */}
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-[var(--accent-blue)] rounded-full"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: isActive ? 40 : 0,
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      />

                      <span className={`text-[10px] font-semibold tracking-widest uppercase ${
                        isActive ? "text-[var(--accent-blue)]" : "text-[var(--foreground-muted)]"
                      }`}>
                        {feature.tagline}
                      </span>

                      <div className="flex items-center gap-3 mt-2 mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? "bg-[var(--accent-blue)]/10"
                            : "bg-[var(--background-secondary)]"
                        }`}>
                          <feature.icon className={`h-4 w-4 ${
                            isActive ? "text-[var(--accent-blue)]" : "text-[var(--foreground-muted)]"
                          }`} />
                        </div>
                        <span className={`font-medium ${
                          isActive ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
                        }`}>
                          {feature.label}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed ${
                        isActive ? "text-[var(--foreground-secondary)]" : "text-[var(--foreground-muted)]"
                      }`}>
                        {feature.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Right: Demo content */}
              <div className="float-card rounded-2xl overflow-hidden">
                {activeTab === "signals" && <SignalsDemo />}
                {activeTab === "sources" && <SourcesDemo />}
                {activeTab === "ai" && <AIDemo />}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

function SignalsDemo() {
  const signals = [
    { name: "AI Agent Frameworks", category: "Technology", confidence: 94, trend: "+12%", lifecycle: "Emerging", lifecycleColor: "blue" },
    { name: "Climate Tech Investment", category: "Economic", confidence: 87, trend: "+8%", lifecycle: "Growing", lifecycleColor: "amber" },
    { name: "Quantum Computing", category: "Technology", confidence: 76, trend: "+5%", lifecycle: "Weak", lifecycleColor: "gray" },
    { name: "Remote Work Evolution", category: "Social", confidence: 91, trend: "+15%", lifecycle: "Mainstream", lifecycleColor: "green" },
  ];

  const lifecycleStyles: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="p-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/[0.04]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">Signals</span>
          </div>
          <span className="text-xs text-[var(--foreground-muted)]">247 active</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-black/[0.03] text-[var(--foreground-muted)]">Updated 2m ago</span>
      </div>

      {/* Signal list */}
      <div className="space-y-1">
        {signals.map((signal, i) => (
          <motion.div
            key={signal.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between p-3 -mx-2 rounded-lg hover:bg-black/[0.02] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              {/* Confidence bar */}
              <div className="w-1 h-10 rounded-full bg-black/[0.04] overflow-hidden">
                <div
                  className="w-full bg-[var(--accent-blue)] rounded-full transition-all"
                  style={{ height: `${signal.confidence}%` }}
                />
              </div>
              <div>
                <div className="font-medium text-sm group-hover:text-[var(--accent-blue)] transition-colors">{signal.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.03] text-[var(--foreground-muted)]">{signal.category}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${lifecycleStyles[signal.lifecycleColor]}`}>{signal.lifecycle}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-light tabular-nums">{signal.confidence}<span className="text-xs text-[var(--foreground-muted)]">%</span></div>
              <div className="text-xs font-medium text-emerald-600">{signal.trend}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SourcesDemo() {
  const sources = [
    { name: "GitHub", count: "1,247", category: "Developer" },
    { name: "Hacker News", count: "892", category: "Developer" },
    { name: "Reddit", count: "634", category: "Social" },
    { name: "TechCrunch", count: "421", category: "News" },
    { name: "ArXiv", count: "287", category: "Research" },
    { name: "Twitter/X", count: "1,156", category: "Social" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/[0.04]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Data Sources</span>
          <span className="text-xs text-[var(--foreground-muted)]">500+ monitored</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          All operational
        </span>
      </div>

      {/* Sources grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sources.map((source, i) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-xl border border-black/[0.04] bg-white hover:border-black/[0.08] hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/[0.03] text-[var(--foreground-muted)]">{source.category}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="font-medium text-sm mb-1 group-hover:text-[var(--accent-blue)] transition-colors">{source.name}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light tabular-nums">{source.count}</span>
              <span className="text-xs text-[var(--foreground-muted)]">today</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AIDemo() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">AI Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">Claude</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Gemini</span>
        </div>
      </div>

      {/* Analysis card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl border border-black/[0.04] bg-white mb-4"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-[var(--foreground-muted)] mb-1">Analyzing Signal</div>
            <div className="font-medium">Autonomous AI Agents</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">High Confidence</span>
        </div>

        <div className="grid grid-cols-3 gap-4 py-4 border-y border-black/[0.04]">
          <div>
            <div className="text-[11px] text-[var(--foreground-muted)] uppercase tracking-wide mb-1">Category</div>
            <div className="text-sm font-medium">Technology</div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--foreground-muted)] uppercase tracking-wide mb-1">Lifecycle</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-400">Weak</span>
              <span className="text-[var(--foreground-muted)]">→</span>
              <span className="text-sm font-medium text-blue-600">Emerging</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--foreground-muted)] uppercase tracking-wide mb-1">Confidence</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "89%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
              <span className="text-sm font-medium tabular-nums">89%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Insight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-xl bg-gradient-to-br from-purple-50/80 to-blue-50/50 border border-purple-100/50"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-[11px] font-medium text-purple-600 uppercase tracking-wide">AI Insight</span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--foreground-secondary)]">
          Rapid adoption in developer tooling. GitHub activity up 340% QoQ. Multiple enterprise deployments emerging.
          <span className="font-medium text-[var(--foreground)]"> Recommend: High priority tracking.</span>
        </p>
      </motion.div>
    </div>
  );
}

// Mobile-specific compact demo components
function SignalsDemoMobile() {
  const signals = [
    { name: "AI Agent Frameworks", confidence: 94, trend: "+12%", lifecycle: "Emerging" },
    { name: "Climate Tech Investment", confidence: 87, trend: "+8%", lifecycle: "Growing" },
    { name: "Quantum Computing", confidence: 76, trend: "+5%", lifecycle: "Weak" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          247 active signals
        </span>
        <span>Updated 2m ago</span>
      </div>

      <div className="space-y-2">
        {signals.map((signal) => (
          <div
            key={signal.name}
            className="flex items-center justify-between p-3 rounded-lg bg-black/[0.02]"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{signal.name}</div>
              <div className="text-xs text-[var(--foreground-muted)]">{signal.lifecycle}</div>
            </div>
            <div className="text-right ml-3">
              <div className="text-lg font-light tabular-nums">{signal.confidence}%</div>
              <div className="text-xs font-medium text-emerald-600">{signal.trend}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourcesDemoMobile() {
  const sources = [
    { name: "GitHub", count: "1.2K", category: "Dev" },
    { name: "HN", count: "892", category: "Dev" },
    { name: "Reddit", count: "634", category: "Social" },
    { name: "ArXiv", count: "287", category: "Research" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--foreground-muted)]">
        <span>500+ sources monitored</span>
        <span className="flex items-center gap-1.5 text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          All active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sources.map((source) => (
          <div
            key={source.name}
            className="p-3 rounded-lg border border-black/[0.04] bg-white"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.03] text-[var(--foreground-muted)]">{source.category}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="font-medium text-sm">{source.name}</div>
            <div className="text-lg font-light tabular-nums">{source.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIDemoMobile() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 text-xs text-[var(--foreground-muted)]">
        <span>Powered by AI</span>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600">Claude</span>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">Gemini</span>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-black/[0.04] bg-white mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm">AI Agents</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">89%</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
          <span>Technology</span>
          <span>•</span>
          <span className="text-blue-600 font-medium">Emerging</span>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50/80 to-blue-50/50 border border-purple-100/50">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3 w-3 text-purple-500" />
          <span className="text-[10px] font-medium text-purple-600 uppercase">Insight</span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
          Rapid adoption in dev tools. GitHub +340% QoQ.
          <span className="font-medium text-[var(--foreground)]"> High priority.</span>
        </p>
      </div>
    </div>
  );
}
