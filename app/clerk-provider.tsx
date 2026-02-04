"use client";

import type { ReactNode } from "react";

interface ClerkWrapperProps {
  children: ReactNode;
}

// Clerk authentication disabled for now - just pass through children
export function ClerkWrapper({ children }: ClerkWrapperProps) {
  return <>{children}</>;
}
