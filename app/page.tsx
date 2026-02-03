"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  Clock,
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Radio,
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const createSubscriber = useMutation(api.subscribers.create);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address");
      setStatus("error");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      await createSubscriber({
        email: email.trim(),
        source: "landing",
      });
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const valueProps = [
    {
      icon: Clock,
      title: "Save 10+ Hours/Week",
      description: "AI curates the noise so you don't have to. Get only what matters, delivered to your inbox.",
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "Never Miss a Trend",
      description: "Automated signal detection across tech, AI, and innovation. Stay ahead of the curve.",
      color: "green",
    },
    {
      icon: Zap,
      title: "Actionable Insights",
      description: "Not just news—strategic intelligence you can act on. Every issue is designed for impact.",
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      gradient: "from-blue-500/10 to-blue-600/10",
    },
    green: {
      bg: "bg-green-500/20",
      border: "border-green-500/30",
      icon: "text-green-400",
      gradient: "from-green-500/10 to-green-600/10",
    },
    purple: {
      bg: "bg-purple-500/20",
      border: "border-purple-500/30",
      icon: "text-purple-400",
      gradient: "from-purple-500/10 to-purple-600/10",
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl mx-auto text-center"
        >
          {/* Logo/Brand */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Radio className="h-7 w-7 text-purple-400" />
            </div>
            <span className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">SysInno</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] tracking-tight mb-6"
          >
            AI-Curated Tech Intelligence,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Weekly
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10"
          >
            Stop drowning in tech news. Our AI analyzes thousands of sources to deliver
            the insights that actually matter—curated, concise, and actionable.
          </motion.p>

          {/* Email Signup Form */}
          <motion.div variants={itemVariants} className="max-w-md mx-auto mb-16">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass bg-green-500/10 border border-green-500/30 rounded-xl p-6"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-lg font-medium text-green-300">You're on the list!</span>
                </div>
                <p className="text-sm text-[#a3a3a3]">
                  Check your inbox for a confirmation. Your first issue arrives soon.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-[#f5f5f5] placeholder:text-[#666] focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      disabled={status === "loading"}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>

                {status === "error" && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <p className="text-xs text-[#666]">
                  Free weekly newsletter. Unsubscribe anytime.
                </p>
              </form>
            )}
          </motion.div>

          {/* Value Propositions */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {valueProps.map((prop, index) => {
              const colors = colorClasses[prop.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`glass bg-gradient-to-br ${colors.gradient} border border-white/5 rounded-xl p-6 text-left`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} border ${colors.border} mb-4`}>
                    <prop.icon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">{prop.title}</h3>
                  <p className="text-sm text-[#a3a3a3]">{prop.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Social Proof Section */}
          <motion.div variants={itemVariants} className="glass bg-white/5 border border-white/5 rounded-xl p-8">
            <h3 className="text-lg font-medium text-[#f5f5f5] mb-6">
              Trusted by tech leaders and innovators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "The only newsletter I actually read every week. Saves me hours of research.",
                  author: "Tech Executive",
                  company: "Fortune 500",
                },
                {
                  quote: "Finally, AI-curated content that understands what matters to builders.",
                  author: "Startup Founder",
                  company: "YC Alumni",
                },
                {
                  quote: "Strategic insights I can't get anywhere else. Essential reading.",
                  author: "Product Leader",
                  company: "Big Tech",
                },
              ].map((testimonial, index) => (
                <div key={index} className="text-left">
                  <p className="text-sm text-[#a3a3a3] italic mb-3">"{testimonial.quote}"</p>
                  <p className="text-xs text-[#666]">
                    <span className="text-[#f5f5f5]">{testimonial.author}</span> — {testimonial.company}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center text-xs text-[#666]">
          <p>&copy; {new Date().getFullYear()} SysInno. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
