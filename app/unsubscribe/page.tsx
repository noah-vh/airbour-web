"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { UserX, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const sid = searchParams.get("sid");

  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unsubscribeMutation = useMutation(api.subscribers.unsubscribe);

  const handleUnsubscribe = async () => {
    if (!sid) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await unsubscribeMutation({
        id: sid as Id<"subscribers">,
      });

      if (result.success) {
        setIsUnsubscribed(true);
      } else {
        setError(result.message || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Missing subscriber ID
  if (!sid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="subtle-card bg-card border border-border rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 border border-red-500/30">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-foreground mb-3">
              Invalid Unsubscribe Link
            </h1>

            <p className="text-muted-foreground mb-8">
              This unsubscribe link appears to be invalid or expired. Please use the link from your email.
            </p>

            <Link href="/">
              <button className="w-full subtle-card bg-blue-muted border border-blue/20 rounded-lg px-4 py-3 transition-all hover:bg-blue/10 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4 text-blue" />
                <span className="text-sm text-blue">Back to Homepage</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isUnsubscribed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="subtle-card bg-card border border-border rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-foreground mb-3">
              You've Been Unsubscribed
            </h1>

            <p className="text-muted-foreground mb-4">
              You will no longer receive emails from us.
            </p>

            <p className="text-sm text-muted-foreground mb-8">
              If you change your mind, you can always subscribe again from our website.
            </p>

            <Link href="/">
              <button className="w-full subtle-card bg-blue-muted border border-blue/20 rounded-lg px-4 py-3 transition-all hover:bg-blue/10 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4 text-blue" />
                <span className="text-sm text-blue">Back to Homepage</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="subtle-card bg-card border border-border rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-muted border border-amber/30">
              <UserX className="h-8 w-8 text-amber" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-3">
            We're sorry to see you go
          </h1>

          <p className="text-muted-foreground mb-6">
            Are you sure you want to unsubscribe from our newsletter? You'll no longer receive updates and insights from us.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full subtle-card bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 transition-all hover:bg-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 text-red-400 animate-spin" />
                  <span className="text-sm text-red-300">Processing...</span>
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-300">Yes, Unsubscribe Me</span>
                </>
              )}
            </button>

            <Link href="/">
              <button className="w-full subtle-card bg-muted border border-border rounded-lg px-4 py-3 transition-all hover:bg-muted/80 flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">No, Keep Me Subscribed</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
