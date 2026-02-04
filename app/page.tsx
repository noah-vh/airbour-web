"use client";

import { Hero } from "@/components/landing/hero";
import { MetricsStrip } from "@/components/landing/metrics-strip";
import { UseCasesStrip } from "@/components/landing/use-cases-strip";
import { VisualFlow } from "@/components/landing/visual-flow";
import { SourcesSection } from "@/components/landing/sources-section";
import { SignalLifecycle } from "@/components/landing/signal-lifecycle";
import { OutputShowcase } from "@/components/landing/output-showcase";
import { Personalization } from "@/components/landing/personalization";
import { FeaturesSection } from "@/components/landing/features-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";
import { GradientOrbs } from "@/components/ui/gradient-orbs";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { GrainOverlay } from "@/components/ui/grain-overlay";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] relative">
      {/* Ambient effects */}
      <GradientOrbs />
      <ScrollProgress />
      <GrainOverlay />

      <main className="relative z-10">
        {/* Hero with interactive demo */}
        <Hero />

        {/* Key metrics */}
        <MetricsStrip />

        {/* Who it's for */}
        <UseCasesStrip />

        {/* How it works - visual flow */}
        <VisualFlow />

        {/* Data sources - where signals come from */}
        <SourcesSection />

        {/* Signal lifecycle - watch trends mature */}
        <SignalLifecycle />

        {/* What you get - output previews */}
        <OutputShowcase />

        {/* Personalization - AI learning demo */}
        <Personalization />

        {/* Features deep dive */}
        <FeaturesSection />

        {/* Common questions */}
        <FAQSection />

        {/* Final CTA */}
        <CTASection />
      </main>
    </div>
  );
}
