"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Zap,
  Users,
  Mail,
  TrendingUp,
  ExternalLink,
  Check,
} from "lucide-react";

// Placeholder data
const currentPlan = {
  name: "Pro",
  price: "$29/month",
  subscribers: 5000,
  usedSubscribers: 2340,
  emails: 50000,
  usedEmails: 23456,
  features: [
    "Up to 5,000 subscribers",
    "50,000 emails/month",
    "Custom branding",
    "Analytics dashboard",
    "Priority support",
  ],
};

const plans = [
  {
    name: "Starter",
    price: "$0/month",
    subscribers: 500,
    emails: 1000,
    current: false,
    features: ["500 subscribers", "1,000 emails/month", "Basic templates"],
  },
  {
    name: "Pro",
    price: "$29/month",
    subscribers: 5000,
    emails: 50000,
    current: true,
    features: ["5,000 subscribers", "50,000 emails/month", "Custom branding", "Analytics"],
  },
  {
    name: "Enterprise",
    price: "$99/month",
    subscribers: 50000,
    emails: 500000,
    current: false,
    features: ["50,000 subscribers", "500,000 emails/month", "Dedicated support", "API access"],
  },
];

export default function BillingSettingsPage() {
  const subscriberPercentage = (currentPlan.usedSubscribers / currentPlan.subscribers) * 100;
  const emailPercentage = (currentPlan.usedEmails / currentPlan.emails) * 100;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Current Plan
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your active subscription and usage
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{currentPlan.name}</div>
              <div className="text-sm text-muted-foreground">{currentPlan.price}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-400" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue" />
            Usage Statistics
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your current billing period usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscribers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-medium text-foreground">Subscribers</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentPlan.usedSubscribers.toLocaleString()} / {currentPlan.subscribers.toLocaleString()}
              </span>
            </div>
            <Progress value={subscriberPercentage} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground/60">
              {Math.round(subscriberPercentage)}% of your subscriber limit used
            </p>
          </div>

          {/* Emails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-sm font-medium text-foreground">Emails Sent</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {currentPlan.usedEmails.toLocaleString()} / {currentPlan.emails.toLocaleString()}
              </span>
            </div>
            <Progress value={emailPercentage} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground/60">
              {Math.round(emailPercentage)}% of your monthly email limit used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Available Plans</CardTitle>
          <CardDescription className="text-muted-foreground">
            Upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-4 rounded-lg border ${
                  plan.current
                    ? "bg-purple-muted border-purple/30"
                    : "bg-muted/50 border hover:bg-muted transition-colors"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  {plan.current && (
                    <span className="px-2 py-0.5 text-xs rounded bg-purple-muted text-purple border border-purple/30">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-foreground mb-3">{plan.price}</div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3 w-3 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button
                    className="w-full bg-muted/50 border text-foreground hover:bg-muted transition-colors"
                  >
                    {plan.price === "$0/month" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stripe Portal */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            Payment Management
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your payment methods and billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
            <div>
              <p className="font-medium text-foreground">Stripe Customer Portal</p>
              <p className="text-sm text-muted-foreground">
                Update payment methods, view invoices, and manage your subscription
              </p>
            </div>
            <Button className="bg-green-muted border border-green-400/30 text-green-400 hover:bg-green-muted/80 transition-colors">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
