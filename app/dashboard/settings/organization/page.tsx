"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Mail,
  Shield,
  Plus,
  Trash2,
  Edit,
  Crown,
} from "lucide-react";

// Placeholder data - will be replaced with actual org data
const placeholderMembers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "owner" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "admin" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "member" },
];

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState("My Organization");
  const [orgSlug, setOrgSlug] = useState("my-organization");

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType }> = {
      owner: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Crown },
      admin: { color: "bg-purple-muted text-purple border-purple/30", icon: Shield },
      member: { color: "bg-blue-muted text-blue border-blue/30", icon: Users },
    };

    const config = configs[role] || configs.member;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Organization Details */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue" />
            Organization Details
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName" className="text-foreground">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
              placeholder="Enter organization name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgSlug" className="text-foreground">Organization Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground/60 text-sm">airbour.com/</span>
              <Input
                id="orgSlug"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
                placeholder="organization-slug"
              />
            </div>
            <p className="text-xs text-muted-foreground/60">
              This is used in URLs and API requests
            </p>
          </div>

          <Button className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-blue" />
                Team Members
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage who has access to your organization
              </CardDescription>
            </div>
            <Button className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {placeholderMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-muted border border-blue/30 flex items-center justify-center">
                    <span className="text-blue font-medium">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  {member.role !== "owner" && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 h-auto text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-amber-400" />
            Pending Invitations
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Invitations that have not been accepted yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
            <p className="text-muted-foreground">No pending invitations</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
