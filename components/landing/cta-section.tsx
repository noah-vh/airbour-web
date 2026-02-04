"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const createSubscriber = useMutation(api.subscribers.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email");
      setStatus("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Invalid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await createSubscriber({
        email: email.trim(),
        source: "cta",
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong");
    }
  };

  return (
    <section className="relative py-32 md:py-44 bg-[#141414] text-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--accent-blue)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Editorial layout */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Left: Statement */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6"
              >
                Join the Waitlist
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-6"
              >
                The future satisfies those who see it first.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-lg text-white/60 leading-relaxed"
              >
                Early access to Airbour. Be among the first to transform how you track emerging signals and opportunities.
              </motion.p>
            </div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {status === "success" ? (
                <div className="p-10 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-lg">You're on the list</p>
                      <p className="text-sm text-white/50">We'll be in touch soon</p>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Thank you for your interest in Airbour. We're onboarding early users in batches—you'll hear from us when it's your turn.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="p-8 md:p-10 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm space-y-5">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">
                        Work email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        placeholder="you@company.com"
                        className="w-full px-5 py-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all text-lg"
                        disabled={status === "loading"}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-[#141414] px-6 py-4 rounded-xl font-medium text-lg transition-all group"
                    >
                      {status === "loading" ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Request Early Access
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    {status === "error" && errorMessage && (
                      <div className="flex items-center justify-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Social proof hint */}
                  <div className="flex items-center justify-center gap-4 text-white/30 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500/60" />
                      Limited beta spots
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>No credit card required</span>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
