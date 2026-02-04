"use client";

import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  isMapPage?: boolean;
}

export function BaseLayout({
  children,
  className,
  noPadding = false,
  isMapPage = false
}: BaseLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        isMapPage ? "relative" : "flex flex-col",
        !noPadding && !isMapPage && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}