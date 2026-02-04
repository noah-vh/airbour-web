"use client";

import Link from "next/link";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Thanks for subscribing!
          </h1>

          {/* Message */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Check your inbox for a confirmation email.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            You'll start receiving our newsletter with the latest innovation insights and updates.
          </p>

          {/* Back to Home */}
          <Link href="/">
            <button className="w-full bg-blue-muted border border-blue/20 rounded-lg px-4 py-3 transition-all hover:bg-blue/10 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">Back to Dashboard</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
