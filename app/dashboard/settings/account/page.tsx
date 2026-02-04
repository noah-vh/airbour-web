"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();

  if (!isLoaded) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Profile Section */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-blue" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-blue-muted text-blue text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="ghost"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-muted border p-0 hover:bg-muted/80"
                onClick={() => user?.setProfileImage({ file: null })}
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">
                {user?.fullName || "User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">First Name</Label>
              <Input
                id="firstName"
                defaultValue={user?.firstName || ""}
                className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
              <Input
                id="lastName"
                defaultValue={user?.lastName || ""}
                className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">Username</Label>
            <Input
              id="username"
              defaultValue={user?.username || ""}
              className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Section */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue" />
            Email Address
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your email is managed through your authentication provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.emailAddresses.map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground/60" />
                <span className="text-foreground">{email.emailAddress}</span>
                {email.id === user.primaryEmailAddressId && (
                  <span className="px-2 py-0.5 text-xs rounded bg-green-muted text-green-400 border border-green-400/30">
                    Primary
                  </span>
                )}
              </div>
              {email.verification?.status === "verified" && (
                <span className="text-xs text-green-400">Verified</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground">Account Actions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your account settings through Clerk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => openUserProfile()}
            className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors"
          >
            Manage Account in Clerk
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
