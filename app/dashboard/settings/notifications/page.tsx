"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Mail,
  TrendingUp,
  AlertCircle,
  Users,
  Calendar,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
}

export default function NotificationsSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState<NotificationPreference[]>([
    {
      id: "newsletter-sent",
      label: "Newsletter Sent",
      description: "Get notified when a scheduled newsletter is successfully sent",
      enabled: true,
      icon: Mail,
    },
    {
      id: "newsletter-failed",
      label: "Newsletter Failed",
      description: "Get notified when a newsletter fails to send",
      enabled: true,
      icon: AlertCircle,
    },
    {
      id: "new-subscriber",
      label: "New Subscribers",
      description: "Get notified when someone subscribes to your newsletter",
      enabled: false,
      icon: Users,
    },
    {
      id: "weekly-digest",
      label: "Weekly Digest",
      description: "Receive a weekly summary of your newsletter performance",
      enabled: true,
      icon: Calendar,
    },
    {
      id: "performance-alerts",
      label: "Performance Alerts",
      description: "Get notified about significant changes in open or click rates",
      enabled: true,
      icon: TrendingUp,
    },
    {
      id: "billing-alerts",
      label: "Billing Alerts",
      description: "Get notified about upcoming charges and payment issues",
      enabled: true,
      icon: AlertCircle,
    },
  ]);

  const [productUpdates, setProductUpdates] = useState({
    features: true,
    tips: false,
    news: false,
  });

  const toggleNotification = (id: string) => {
    setEmailNotifications(
      emailNotifications.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleSave = () => {
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue" />
            Email Notifications
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotifications.map((pref) => {
            const Icon = pref.icon;
            return (
              <div
                key={pref.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border"
              >
                <Checkbox
                  id={pref.id}
                  checked={pref.enabled}
                  onCheckedChange={() => toggleNotification(pref.id)}
                  className="mt-1 border data-[state=checked]:bg-blue data-[state=checked]:border-blue"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={pref.id}
                    className="text-foreground font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground/60" />
                    {pref.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{pref.description}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Product Updates */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple" />
            Product Updates
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Stay informed about new features and improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
            <Checkbox
              id="features"
              checked={productUpdates.features}
              onCheckedChange={(checked) =>
                setProductUpdates({ ...productUpdates, features: checked as boolean })
              }
              className="mt-1 border data-[state=checked]:bg-blue data-[state=checked]:border-blue"
            />
            <div className="flex-1">
              <Label htmlFor="features" className="text-foreground font-medium cursor-pointer">
                New Features
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Get notified when we launch new features and improvements
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
            <Checkbox
              id="tips"
              checked={productUpdates.tips}
              onCheckedChange={(checked) =>
                setProductUpdates({ ...productUpdates, tips: checked as boolean })
              }
              className="mt-1 border data-[state=checked]:bg-blue data-[state=checked]:border-blue"
            />
            <div className="flex-1">
              <Label htmlFor="tips" className="text-foreground font-medium cursor-pointer">
                Tips & Tutorials
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive helpful tips to get the most out of your newsletters
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
            <Checkbox
              id="news"
              checked={productUpdates.news}
              onCheckedChange={(checked) =>
                setProductUpdates({ ...productUpdates, news: checked as boolean })
              }
              className="mt-1 border data-[state=checked]:bg-blue data-[state=checked]:border-blue"
            />
            <div className="flex-1">
              <Label htmlFor="news" className="text-foreground font-medium cursor-pointer">
                Company News
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated with company announcements and news
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Schedule */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Notification Schedule
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Control when you receive notification emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground">
              Notifications are sent in real-time. Digest emails are sent every Monday at 9:00 AM in your local timezone.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
