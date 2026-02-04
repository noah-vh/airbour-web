"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsed: Date | null;
}

// Placeholder data
const initialKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    prefix: "sk_live_abc",
    createdAt: new Date("2024-01-15"),
    lastUsed: new Date("2024-02-01"),
  },
  {
    id: "2",
    name: "Development API Key",
    prefix: "sk_test_xyz",
    createdAt: new Date("2024-01-20"),
    lastUsed: null,
  },
];

export default function ApiKeysSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialKeys);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    // Generate a mock API key
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const apiKey: ApiKey = {
      id: Math.random().toString(36).substring(7),
      name: newKeyName,
      prefix: newKey.substring(0, 11),
      createdAt: new Date(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewlyCreatedKey(newKey);
    setNewKeyName("");
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    setDeleteConfirmId(null);
    toast.success("API key revoked");
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewlyCreatedKey(null);
    setNewKeyName("");
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <Card className="bg-card border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                API Keys
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <Key className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{apiKey.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-mono">{apiKey.prefix}...</span>
                        <span>Created {apiKey.createdAt.toLocaleDateString()}</span>
                        {apiKey.lastUsed && (
                          <span>Last used {apiKey.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyKey(apiKey.prefix + "...")}
                      className="p-2 h-auto text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      {copiedKey === apiKey.prefix + "..." ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmId(apiKey.id)}
                      className="p-2 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No API keys yet</p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Your First Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-card border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              Never share your API keys in public repositories or client-side code
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              Use environment variables to store API keys in your applications
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              Rotate your API keys periodically for enhanced security
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">•</span>
              Revoke any keys that may have been compromised immediately
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="bg-background border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {newlyCreatedKey ? "API Key Created" : "Generate New API Key"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {newlyCreatedKey
                ? "Copy your API key now. You won't be able to see it again."
                : "Give your API key a name to help you identify it later."}
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-amber-400 font-mono break-all">
                    {newlyCreatedKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyKey(newlyCreatedKey)}
                    className="ml-2 p-2 h-auto text-amber-400 hover:bg-amber-500/20"
                  >
                    {copiedKey === newlyCreatedKey ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-400">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-foreground">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-muted/50 border text-foreground placeholder:text-muted-foreground/60"
                  placeholder="e.g., Production API Key"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreatedKey ? (
              <Button
                onClick={handleCloseCreateDialog}
                className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue-muted/80 transition-colors"
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCloseCreateDialog}
                  className="bg-muted/50 border text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 transition-colors"
                >
                  Generate Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="bg-background border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Revoke API Key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to revoke this API key? This action cannot be undone and any applications using this key will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="bg-muted/50 border text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDeleteKey(deleteConfirmId)}
              className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
