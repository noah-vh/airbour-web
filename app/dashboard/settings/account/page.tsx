"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-blue" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Authentication is currently disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User account management is not available while authentication is disabled.
            The application is running in development mode.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
