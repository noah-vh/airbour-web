"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface TabSliderProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabSlider({ tabs, activeTab, onTabChange }: TabSliderProps) {
  const [tabBounds, setTabBounds] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const activeRef = tabsRef.current[activeIndex];
    if (activeRef && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tabRect = activeRef.getBoundingClientRect();
      setTabBounds({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className="relative flex p-1 bg-[var(--background-secondary)] rounded-lg"
    >
      {/* Sliding background */}
      <motion.div
        className="absolute top-1 bottom-1 bg-[var(--foreground)] rounded-md"
        initial={false}
        animate={{ left: tabBounds.left, width: tabBounds.width }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          ref={(el) => { tabsRef.current[i] = el; }}
          onClick={() => onTabChange(tab.id)}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.id
              ? "text-[var(--background)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
