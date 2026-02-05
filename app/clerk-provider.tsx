"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

interface ClerkWrapperProps {
  children: ReactNode;
}

export function ClerkWrapper({ children }: ClerkWrapperProps) {
  // Only use ClerkProvider if publishable key is configured
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
