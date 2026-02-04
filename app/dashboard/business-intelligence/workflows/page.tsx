"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Settings,
  Play,
  Pause,
  Clock,
  Users,
  Database,
  Radio,
  MessageSquare,
  BarChart3,
  Mail,
  Share2,
  Calendar,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  Target,
  Workflow,
  GitBranch,
  Filter,
  Bell,
  RefreshCw,
  TrendingUp,
  Building2,
  Shield,
  MapPin,
  Download,
  Eye,
  EyeOff,
  ToggleLeft,
  ChevronRight,
  ChevronDown,
  Link as LinkIcon,
  Activity,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// Mock data for workflow system
const workflowData = {
  dataFlow: [
    {
      id: 1,
      source: "Web Scraping",
      icon: Radio,
      connections: ["Processing Engine", "Signal Detection"],
      status: "active",
      dataPoints: "2.3M/day",
      description: "Monitors competitor websites, industry blogs, and news sources"
    },
    {
      id: 2,
      source: "Social Media APIs",
      icon: MessageSquare,
      connections: ["Processing Engine", "Sentiment Analysis"],
      status: "active",
      dataPoints: "847K/day",
      description: "Twitter, LinkedIn, Reddit mentions and discussions"
    },
    {
      id: 3,
      source: "SharePoint Connector",
      icon: Building2,
      connections: ["Processing Engine", "Document Analysis"],
      status: "configured",
      dataPoints: "156/day",
      description: "Internal documents, reports, and team insights"
    },
    {
      id: 4,
      source: "Processing Engine",
      icon: Database,
      connections: ["Business Intelligence", "Analytics Dashboard"],
      status: "active",
      dataPoints: "Real-time",
      description: "Central data processing and pattern recognition"
    },
    {
      id: 5,
      source: "Business Intelligence",
      icon: BarChart3,
      connections: ["Reports", "Alerts", "Team Dashboards"],
      status: "active",
      dataPoints: "24/7",
      description: "Strategic insights and competitive analysis"
    }
  ],
  automations: [
    {
      id: 1,
      name: "Competitor Price Alert",
      trigger: "Price change detected",
      actions: ["Email stakeholders", "Update dashboard", "Log in SharePoint"],
      frequency: "Real-time",
      lastTriggered: "2 hours ago",
      status: "active",
      team: "Strategy Team"
    },
    {
      id: 2,
      name: "Weekly Market Summary",
      trigger: "Every Monday 9:00 AM",
      actions: ["Generate report", "Email to leadership", "Schedule review meeting"],
      frequency: "Weekly",
      lastTriggered: "3 days ago",
      status: "active",
      team: "Executive Team"
    },
    {
      id: 3,
      name: "Innovation Signal Detection",
      trigger: "New technology mention",
      actions: ["Alert R&D team", "Add to opportunity pipeline", "Create research task"],
      frequency: "Real-time",
      lastTriggered: "47 minutes ago",
      status: "active",
      team: "Innovation Team"
    },
    {
      id: 4,
      name: "Customer Feedback Analysis",
      trigger: "Negative sentiment spike",
      actions: ["Alert customer success", "Analyze root cause", "Create action plan"],
      frequency: "Every 4 hours",
      lastTriggered: "6 hours ago",
      status: "paused",
      team: "Customer Success"
    }
  ],
  teamModules: [
    {
      team: "Executive Leadership",
      modules: ["Strategic Overview", "Revenue Analytics", "Market Positioning"],
      users: 4,
      automations: 6,
      reportFrequency: "Daily",
      priority: "high"
    },
    {
      team: "Strategy Team",
      modules: ["Competitive Intelligence", "Market Analysis", "Pricing Strategy"],
      users: 8,
      automations: 12,
      reportFrequency: "Real-time",
      priority: "high"
    },
    {
      team: "Innovation Team",
      modules: ["Technology Signals", "Patent Tracking", "Trend Analysis"],
      users: 6,
      automations: 8,
      reportFrequency: "Weekly",
      priority: "medium"
    },
    {
      team: "Customer Success",
      modules: ["Feedback Analysis", "Satisfaction Trends", "Churn Prediction"],
      users: 12,
      automations: 15,
      reportFrequency: "Daily",
      priority: "high"
    }
  ],
  scheduledReports: [
    {
      id: 1,
      name: "Executive Dashboard",
      recipients: ["CEO", "COO", "Strategy Lead"],
      frequency: "Daily at 8:00 AM",
      format: "PDF + Interactive Link",
      lastSent: "This morning",
      status: "active"
    },
    {
      id: 2,
      name: "Competitive Intelligence Brief",
      recipients: ["Strategy Team", "Product Team"],
      frequency: "Twice weekly",
      format: "Email Summary",
      lastSent: "Yesterday",
      status: "active"
    },
    {
      id: 3,
      name: "Market Opportunities Report",
      recipients: ["Innovation Team", "Business Development"],
      frequency: "Weekly on Fridays",
      format: "Detailed Analysis",
      lastSent: "2 days ago",
      status: "active"
    }
  ],
  integrationSettings: {
    sharepoint: {
      connected: true,
      lastSync: "15 minutes ago",
      documentsProcessed: 1247,
      folders: ["Strategy", "Competitive Intel", "Market Research"]
    },
    teams: {
      connected: true,
      channels: 8,
      notifications: 234,
      botActive: true
    },
    outlook: {
      connected: true,
      automatedEmails: 45,
      reportsSent: 23,
      calendarIntegration: true
    }
  }
};

export default function WorkflowsPage() {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);
  const [sharepointPanelOpen, setSharepointPanelOpen] = useState(false);
  const [automationsEnabled, setAutomationsEnabled] = useState(true);

  const handleToggleAutomation = (id: number, enabled: boolean) => {
    const automation = workflowData.automations.find(a => a.id === id);
    toast.success(`${automation?.name} ${enabled ? 'activated' : 'paused'}`);
  };

  const handleTestAutomation = (name: string) => {
    toast.success(`Testing ${name}... Check your email in 30 seconds.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <Workflow className="h-10 w-10 text-purple-400" />
              Business Intelligence Workflows
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Automated intelligence pipeline connecting signals to strategic insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setSharepointPanelOpen(true)}
              className="bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              SharePoint Settings
            </Button>
            <Link href="/dashboard/business-intelligence">
              <Button
                variant="outline"
                className="bg-muted border border-border hover:bg-muted/80 transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                BI Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold text-foreground mt-1">12</p>
                <p className="text-xs text-green-400 mt-1">+3 this week</p>
              </div>
              <Activity className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Processed</p>
                <p className="text-2xl font-bold text-foreground mt-1">3.4M</p>
                <p className="text-xs text-blue-400 mt-1">Today</p>
              </div>
              <Database className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Users</p>
                <p className="text-2xl font-bold text-foreground mt-1">30</p>
                <p className="text-xs text-purple-400 mt-1">Across 4 teams</p>
              </div>
              <Users className="h-8 w-8 text-purple-400 opacity-50" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold text-foreground mt-1">68</p>
                <p className="text-xs text-amber-400 mt-1">This month</p>
              </div>
              <FileText className="h-8 w-8 text-amber-400 opacity-50" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="flow" className="space-y-6">
        <TabsList className="bg-muted border border-border w-full justify-start">
          <TabsTrigger value="flow" className="data-[state=active]:bg-purple-500/20">
            <GitBranch className="h-4 w-4 mr-2" />
            Data Flow
          </TabsTrigger>
          <TabsTrigger value="automations" className="data-[state=active]:bg-purple-500/20">
            <Zap className="h-4 w-4 mr-2" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-purple-500/20">
            <Users className="h-4 w-4 mr-2" />
            Team Collaboration
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-purple-500/20">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Reports
          </TabsTrigger>
        </TabsList>

        {/* Data Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Intelligence Data Flow</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-400">System Healthy</Badge>
                <Button size="sm" variant="outline" className="bg-muted border border-border">
                  <Eye className="h-4 w-4 mr-2" />
                  Monitor
                </Button>
              </div>
            </div>

            {/* Visual Flow Diagram */}
            <div className="relative overflow-x-auto">
              <div className="flex items-center gap-8 pb-4 min-w-max">
                {workflowData.dataFlow.map((node, idx) => (
                  <motion.div
                    key={node.id}
                    whileHover={{ opacity: 0.9 }}
                    className={cn(
                      "relative cursor-pointer",
                      selectedFlow === node.source && "ring-2 ring-purple-500 rounded-lg"
                    )}
                    onClick={() => setSelectedFlow(selectedFlow === node.source ? null : node.source)}
                  >
                    <div className="bg-card border border-border p-6 rounded-lg w-64">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          node.status === "active" ? "bg-green-500/20" : "bg-yellow-500/20"
                        )}>
                          <node.icon className={cn(
                            "h-5 w-5",
                            node.status === "active" ? "text-green-400" : "text-yellow-400"
                          )} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{node.source}</h3>
                          <p className="text-xs text-muted-foreground">{node.dataPoints}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{node.description}</p>
                      <Badge
                        className={cn(
                          "text-xs",
                          node.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        )}
                      >
                        {node.status}
                      </Badge>
                    </div>

                    {/* Connection Arrow */}
                    {idx < workflowData.dataFlow.length - 1 && (
                      <div className="absolute top-1/2 -right-6 transform -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-purple-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Flow Details */}
            <AnimatePresence>
              {selectedFlow && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg"
                >
                  {(() => {
                    const node = workflowData.dataFlow.find(n => n.source === selectedFlow);
                    return (
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-4">{selectedFlow} Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Data Connections</h4>
                            <div className="space-y-2">
                              {node?.connections.map((connection) => (
                                <div key={connection} className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4 text-purple-400" />
                                  <span className="text-sm text-muted-foreground">{connection}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Performance Metrics</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Uptime</span>
                                <span className="text-sm text-green-400">99.7%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Processing Speed</span>
                                <span className="text-sm text-green-400">Real-time</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Error Rate</span>
                                <span className="text-sm text-green-400">0.03%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Integration Status */}
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-foreground mb-4">Platform Integrations</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/dashboard/signals" className="bg-card border border-border p-4 rounded-lg hover:scale-105 transition-transform">
                <Radio className="h-6 w-6 text-blue-400 mb-2" />
                <h4 className="text-sm font-medium text-foreground">Innovation Signals</h4>
                <p className="text-xs text-muted-foreground mt-1">Real-time technology monitoring</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </Link>

              <Link href="/dashboard/mentions" className="bg-card border border-border p-4 rounded-lg hover:scale-105 transition-transform">
                <MessageSquare className="h-6 w-6 text-purple-400 mb-2" />
                <h4 className="text-sm font-medium text-foreground">Mentions</h4>
                <p className="text-xs text-muted-foreground mt-1">Social media monitoring</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </Link>

              <Link href="/dashboard/analytics" className="bg-card border border-border p-4 rounded-lg hover:scale-105 transition-transform">
                <BarChart3 className="h-6 w-6 text-amber-400 mb-2" />
                <h4 className="text-sm font-medium text-foreground">Analytics</h4>
                <p className="text-xs text-muted-foreground mt-1">Performance metrics</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </Link>
            </div>
          </div>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Automated Workflows</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Master Control</span>
                  <Switch
                    checked={automationsEnabled}
                    onCheckedChange={setAutomationsEnabled}
                  />
                </div>
                <Button size="sm" className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30">
                  <Zap className="h-4 w-4 mr-2" />
                  Add Automation
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {workflowData.automations.map((automation) => (
                <motion.div
                  key={automation.id}
                  layout
                  className="bg-card border border-border p-6 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-foreground">{automation.name}</h3>
                        <Badge className={cn(
                          "text-xs",
                          automation.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                        )}>
                          {automation.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {automation.team}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Trigger:</strong> {automation.trigger}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Frequency:</strong> {automation.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Last triggered:</strong> {automation.lastTriggered}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Actions:</p>
                          <ul className="space-y-1">
                            {automation.actions.map((action, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-amber-400" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Switch
                        checked={automation.status === "active"}
                        onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                        disabled={!automationsEnabled}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs bg-muted border border-border"
                        onClick={() => handleTestAutomation(automation.name)}
                      >
                        Test
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Team Collaboration Tab */}
        <TabsContent value="teams" className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-foreground mb-6">Team Access & Modules</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {workflowData.teamModules.map((team) => (
                <motion.div
                  key={team.team}
                  whileHover={{ opacity: 0.9 }}
                  className="bg-card border border-border p-6 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{team.team}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {team.users} users
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          {team.automations} automations
                        </span>
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-xs",
                      team.priority === "high" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {team.priority} priority
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Access Modules:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.modules.map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Reports: {team.reportFrequency}</span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Configure
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Automated Report Delivery</h2>
              <Button className="bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30">
                <Calendar className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>

            <div className="space-y-4">
              {workflowData.scheduledReports.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ opacity: 0.9 }}
                  className="bg-card border border-border p-6 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-foreground">{report.name}</h3>
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {report.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Frequency:</strong> {report.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Format:</strong> {report.format}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Last sent:</strong> {report.lastSent}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Recipients:</p>
                          <div className="flex flex-wrap gap-2">
                            {report.recipients.map((recipient) => (
                              <Badge key={recipient} variant="outline" className="text-xs">
                                {recipient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" className="text-xs bg-muted border border-border">
                        <Mail className="h-4 w-4 mr-1" />
                        Send Now
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs bg-muted border border-border">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* SharePoint Integration Panel */}
      <AnimatePresence>
        {sharepointPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSharepointPanelOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-lg w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Building2 className="h-6 w-6 text-blue-400" />
                  SharePoint Integration
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSharepointPanelOpen(false)}
                  className="bg-muted border border-border"
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400">Connected to SharePoint Online</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Sync Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync:</span>
                        <span className="text-sm text-foreground">{workflowData.integrationSettings.sharepoint.lastSync}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Documents:</span>
                        <span className="text-sm text-foreground">{workflowData.integrationSettings.sharepoint.documentsProcessed}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Monitored Folders</h4>
                    <div className="space-y-1">
                      {workflowData.integrationSettings.sharepoint.folders.map((folder) => (
                        <div key={folder} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span className="text-sm text-muted-foreground">{folder}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline" className="bg-muted border border-border">
                    Configure Folders
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}