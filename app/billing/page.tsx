"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Check,
  Zap,
  Users,
  Mail,
  Crown,
  ArrowRight,
  Loader2,
  Settings,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Plan definitions
const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "100 subscribers",
      "2 newsletters per month",
      "Basic analytics",
      "Email support",
    ],
    limits: {
      subscribers: 100,
      newslettersPerMonth: 2,
    },
  },
  starter: {
    name: "Starter",
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || "price_starter",
    features: [
      "1,000 subscribers",
      "8 newsletters per month",
      "Advanced analytics",
      "Priority email support",
      "Custom branding",
    ],
    limits: {
      subscribers: 1000,
      newslettersPerMonth: 8,
    },
  },
  pro: {
    name: "Pro",
    price: 149,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_pro",
    features: [
      "10,000 subscribers",
      "Unlimited newsletters",
      "Premium analytics",
      "24/7 priority support",
      "Custom branding",
      "API access",
      "Team collaboration",
    ],
    limits: {
      subscribers: 10000,
      newslettersPerMonth: -1, // unlimited
    },
  },
};

type PlanKey = keyof typeof PLANS;

export default function BillingPage() {
  const { isCollapsed } = useSidebar();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // TODO: Get actual organization ID from auth context
  const organizationId = "placeholder_org_id";

  // Convex actions
  const createCheckoutSession = useAction(api.actions.billing.createCheckoutSession);
  const createPortalSession = useAction(api.actions.billing.createPortalSession);

  // Get current organization (mock for now)
  const currentPlan: PlanKey = "free"; // TODO: Get from organization query

  const handleUpgrade = async (planKey: PlanKey) => {
    const plan = PLANS[planKey];
    if (!plan.priceId) return;

    setLoadingPlan(planKey);

    try {
      const result = await createCheckoutSession({
        organizationId: organizationId as any,
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(`Failed to start checkout: ${error.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);

    try {
      const result = await createPortalSession({
        organizationId: organizationId as any,
        returnUrl: `${window.location.origin}/billing`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error(`Failed to open billing portal: ${error.message}`);
    } finally {
      setLoadingPortal(false);
    }
  };

  const getPlanBadge = (planKey: PlanKey) => {
    if (planKey === currentPlan) {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          Current Plan
        </Badge>
      );
    }
    if (planKey === "pro") {
      return (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <Crown className="h-3 w-3 mr-1" />
          Most Popular
        </Badge>
      );
    }
    return null;
  };

  const getButtonText = (planKey: PlanKey) => {
    if (planKey === currentPlan) return "Current Plan";
    if (planKey === "free") return "Downgrade";

    const planOrder: PlanKey[] = ["free", "starter", "pro"];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planKey);

    return targetIndex > currentIndex ? "Upgrade" : "Downgrade";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
        isCollapsed ? "left-16" : "left-64"
      )}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
              <CreditCard className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">
                Billing & Plans
              </h1>
              <p className="text-sm text-[#a3a3a3]">
                Manage your subscription and billing settings
              </p>
            </div>
          </div>

          {currentPlan !== "free" && (
            <Button
              onClick={handleManageBilling}
              disabled={loadingPortal}
              className="bg-white/5 border border-white/10 text-[#f5f5f5] hover:bg-white/10"
            >
              {loadingPortal ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              Manage Billing
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </motion.div>

        {/* Current Plan Summary */}
        <motion.div variants={itemVariants}>
          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3] mb-1">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[#f5f5f5]">
                      {PLANS[currentPlan].name}
                    </h2>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#f5f5f5]">
                    ${PLANS[currentPlan].price}
                    <span className="text-sm font-normal text-[#a3a3a3]">/mo</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <Users className="h-5 w-5 text-blue-400 mb-2" />
                  <p className="text-sm text-[#a3a3a3]">Subscribers</p>
                  <p className="text-lg font-semibold text-[#f5f5f5]">
                    {PLANS[currentPlan].limits.subscribers.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <Mail className="h-5 w-5 text-purple-400 mb-2" />
                  <p className="text-sm text-[#a3a3a3]">Newsletters/mo</p>
                  <p className="text-lg font-semibold text-[#f5f5f5]">
                    {PLANS[currentPlan].limits.newslettersPerMonth === -1
                      ? "Unlimited"
                      : PLANS[currentPlan].limits.newslettersPerMonth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-[#f5f5f5] mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(PLANS) as PlanKey[]).map((planKey) => {
              const plan = PLANS[planKey];
              const isCurrentPlan = planKey === currentPlan;
              const isLoading = loadingPlan === planKey;

              return (
                <motion.div
                  key={planKey}
                  whileHover={{ scale: isCurrentPlan ? 1 : 1.02 }}
                  className={cn(
                    "relative rounded-xl border transition-all duration-300",
                    isCurrentPlan
                      ? "bg-green-500/5 border-green-500/30"
                      : planKey === "pro"
                        ? "bg-purple-500/5 border-purple-500/30"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {planKey === "pro" ? (
                          <Crown className="h-5 w-5 text-purple-400" />
                        ) : planKey === "starter" ? (
                          <Zap className="h-5 w-5 text-blue-400" />
                        ) : (
                          <Users className="h-5 w-5 text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-[#f5f5f5]">{plan.name}</h3>
                      </div>
                      {getPlanBadge(planKey)}
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#f5f5f5]">${plan.price}</span>
                      <span className="text-[#a3a3a3]">/month</span>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              planKey === "pro"
                                ? "text-purple-400"
                                : planKey === "starter"
                                  ? "text-blue-400"
                                  : "text-green-400"
                            )}
                          />
                          <span className="text-sm text-[#a3a3a3]">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => !isCurrentPlan && plan.priceId && handleUpgrade(planKey)}
                      disabled={isCurrentPlan || isLoading || (planKey === "free" && currentPlan === "free")}
                      className={cn(
                        "w-full",
                        isCurrentPlan
                          ? "bg-green-500/20 border border-green-500/30 text-green-300 cursor-default"
                          : planKey === "pro"
                            ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
                            : planKey === "starter"
                              ? "bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                              : "bg-white/5 border border-white/10 text-[#a3a3a3] hover:bg-white/10"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {getButtonText(planKey)}
                          {!isCurrentPlan && planKey !== "free" && (
                            <ArrowRight className="h-4 w-4 ml-2" />
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ / Info Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardHeader>
              <CardTitle className="text-[#f5f5f5]">Billing FAQ</CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                Common questions about billing and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-[#f5f5f5] mb-1">
                  Can I change plans at any time?
                </h4>
                <p className="text-sm text-[#a3a3a3]">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect
                  immediately, and we will prorate any charges.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-[#f5f5f5] mb-1">
                  What happens if I exceed my subscriber limit?
                </h4>
                <p className="text-sm text-[#a3a3a3]">
                  We will notify you when you reach 80% of your limit. If you exceed it, you will
                  need to upgrade to continue adding subscribers.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-[#f5f5f5] mb-1">
                  How do I cancel my subscription?
                </h4>
                <p className="text-sm text-[#a3a3a3]">
                  You can cancel anytime through the Manage Billing portal. Your subscription will
                  remain active until the end of your billing period.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
