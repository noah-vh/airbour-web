"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail } from "lucide-react";

// Only import Clerk hooks if configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AccountWithClerk() {
  const { useUser, useClerk } = require("@clerk/nextjs");
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();

  if (!isLoaded) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U";

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-foreground">{user?.fullName || "User"}</h3>
              <p className="text-sm text-muted-foreground">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue={user?.firstName || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue={user?.lastName || ""} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.emailAddresses.map((email: any) => (
            <div key={email.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <span>{email.emailAddress}</span>
              {email.id === user.primaryEmailAddressId && (
                <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Primary</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border">
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => openUserProfile()}>Manage Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountPlaceholder() {
  return (
    <div className="space-y-6 p-6">
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Authentication not configured</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User account management requires Clerk to be configured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountSettingsPage() {
  if (!isClerkConfigured) {
    return <AccountPlaceholder />;
  }
  return <AccountWithClerk />;
}
