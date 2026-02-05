"use client";

const metrics = [
  { value: "500+", label: "Sources" },
  { value: "12K", label: "Signals/mo" },
  { value: "15hr", label: "Saved weekly" },
  { value: "89%", label: "Accuracy" },
];

export function MetricsStrip() {
  return (
    <section className="py-8 md:py-12 section-warm">
      <div className="container-wide">
        {/* Mobile: Horizontal scrolling compact metrics */}
        <div className="md:hidden -mx-5 px-5">
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin justify-between">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex-shrink-0 text-center min-w-[70px]"
              >
                <div className="font-serif text-2xl text-[var(--foreground)] mb-0.5">
                  {metric.value}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Full grid - unchanged */}
        <div className="hidden md:grid md:grid-cols-4 gap-8">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center"
            >
              <div className="font-serif text-4xl md:text-5xl text-[var(--foreground)] mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-[var(--foreground-muted)] uppercase tracking-wide">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
