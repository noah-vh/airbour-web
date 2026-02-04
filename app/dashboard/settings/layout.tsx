"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Building2,
  Mail,
  CreditCard,
  Key,
  Bell,
  Settings,
} from "lucide-react";

const settingsTabs = [
  {
    name: "Account",
    href: "/dashboard/settings/account",
    icon: User,
    description: "Profile and personal settings",
  },
  {
    name: "Organization",
    href: "/dashboard/settings/organization",
    icon: Building2,
    description: "Team and organization settings",
  },
  {
    name: "Newsletter",
    href: "/dashboard/settings/newsletter",
    icon: Mail,
    description: "Email and branding defaults",
  },
  {
    name: "Billing",
    href: "/dashboard/settings/billing",
    icon: CreditCard,
    description: "Plans and usage",
  },
  {
    name: "API Keys",
    href: "/dashboard/settings/api-keys",
    icon: Key,
    description: "Manage API access",
  },
  {
    name: "Notifications",
    href: "/dashboard/settings/notifications",
    icon: Bell,
    description: "Email preferences",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, organization, and preferences
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <aside className="space-y-1">
          {settingsTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-muted text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "")} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{tab.name}</span>
                  <span className={cn("text-xs", isActive ? "text-muted-foreground" : "text-muted-foreground/60")}>
                    {tab.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="min-h-[600px]">{children}</main>
      </div>
    </div>
  );
}
