"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Palette,
  FileText,
  Image,
  Save,
} from "lucide-react";

export default function NewsletterSettingsPage() {
  const [defaultSender, setDefaultSender] = useState("Newsletter <newsletter@example.com>");
  const [replyTo, setReplyTo] = useState("support@example.com");
  const [footerTemplate, setFooterTemplate] = useState(
    "You received this email because you subscribed to our newsletter.\n\nUnsubscribe | Update preferences\n\n© 2024 Your Company. All rights reserved."
  );
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeSocialLinks, setIncludeSocialLinks] = useState(true);
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [logoUrl, setLogoUrl] = useState("");

  return (
    <div className="space-y-6">
      {/* Default Sender Settings */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue" />
            Email Defaults
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Default sender information for all newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultSender" className="text-foreground">Default Sender</Label>
            <Input
              id="defaultSender"
              value={defaultSender}
              onChange={(e) => setDefaultSender(e.target.value)}
              className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
              placeholder="Name <email@example.com>"
            />
            <p className="text-xs text-muted-foreground/60">
              This will appear as the "From" address in recipient inboxes
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="replyTo" className="text-foreground">Reply-To Address</Label>
            <Input
              id="replyTo"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
              placeholder="replies@example.com"
            />
            <p className="text-xs text-muted-foreground/60">
              Replies will be sent to this address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Template */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            Footer Template
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Default footer content for all newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footerTemplate" className="text-foreground">Footer Content</Label>
            <Textarea
              id="footerTemplate"
              value={footerTemplate}
              onChange={(e) => setFooterTemplate(e.target.value)}
              className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60 min-h-[120px]"
              placeholder="Enter your footer template..."
            />
            <p className="text-xs text-muted-foreground/60">
              Use placeholders like {"{unsubscribe_link}"} and {"{preferences_link}"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Branding Options */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple" />
            Branding Options
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Customize the look and feel of your newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Include Logo</Label>
                <p className="text-xs text-muted-foreground/60">Show your logo in newsletter headers</p>
              </div>
              <Switch
                checked={includeLogo}
                onCheckedChange={setIncludeLogo}
                className="data-[state=checked]:bg-blue"
              />
            </div>

            {includeLogo && (
              <div className="space-y-2 pl-4 border-l-2 border">
                <Label htmlFor="logoUrl" className="text-foreground">Logo URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
                    placeholder="https://example.com/logo.png"
                  />
                  <Button
                    variant="outline"
                    className="bg-muted/50 border text-muted-foreground hover:bg-muted"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Include Social Links</Label>
              <p className="text-xs text-muted-foreground/60">Add social media icons to footer</p>
            </div>
            <Switch
              checked={includeSocialLinks}
              onCheckedChange={setIncludeSocialLinks}
              className="data-[state=checked]:bg-blue"
            />
          </div>

          {/* Custom Colors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Use Custom Colors</Label>
                <p className="text-xs text-muted-foreground/60">Override default template colors</p>
              </div>
              <Switch
                checked={useCustomColors}
                onCheckedChange={setUseCustomColors}
                className="data-[state=checked]:bg-blue"
              />
            </div>

            {useCustomColors && (
              <div className="space-y-2 pl-4 border-l-2 border">
                <Label htmlFor="primaryColor" className="text-foreground">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer border bg-transparent"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60 w-32"
                    placeholder="#6366f1"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors">
          <Save className="h-4 w-4 mr-2" />
          Save Newsletter Settings
        </Button>
      </div>
    </div>
  );
}
