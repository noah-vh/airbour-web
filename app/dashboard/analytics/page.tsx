"use client";

import { Suspense, useState, useEffect } from "react";
import { useQuery, api } from "@/lib/mockConvexTyped";
import type { Signal } from "@/lib/types";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Tag,
  Eye,
  Zap,
  Heart,
  Frown,
  Meh,
  RefreshCw,
  Server,
  HardDrive,
  Gauge
} from "lucide-react";
import { motion } from "framer-motion";

// Loading component
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex items-center gap-3 text-[#f5f5f5]">
        <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
        Loading analytics...
      </div>
    </div>
  );
}

// Chart Components
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'yellow';
}

function MetricCard({ title, value, change, icon, trend, subtitle, color = 'purple' }: MetricCardProps) {
  const colorMap = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', accent: 'text-purple-300' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', accent: 'text-blue-300' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', accent: 'text-green-300' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', accent: 'text-red-300' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', accent: 'text-yellow-300' }
  };
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass ${colors.bg} ${colors.border} rounded-lg p-6 transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} ${colors.border}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
            <span className={trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[#a3a3a3]'}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-[#f5f5f5]">{value}</p>
        <p className="text-sm font-medium text-[#f5f5f5]">{title}</p>
        {subtitle && <p className="text-xs text-[#a3a3a3]">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function VelocityChart({ data }: { data: any }) {
  const maxVelocity = Math.max(...data.trends.map((t: any) => t.velocity));

  return (
    <div className="space-y-4">
      <div className="h-48 flex items-end gap-1">
        {data.trends.slice(-14).map((day: any, index: number) => {
          const height = (day.velocity / maxVelocity) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-[#a3a3a3]">{day.velocity}</div>
              <div
                className="bg-gradient-to-t from-purple-500/40 to-purple-400/20 rounded-t-sm min-h-[4px] w-full transition-all duration-500"
                style={{ height: `${Math.max(height, 8)}%` }}
              />
              <div className="text-xs text-[#a3a3a3] rotate-45 origin-bottom-left">
                {new Date(day.date).getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Peak Day</p>
          <p className="text-[#f5f5f5] font-medium">
            {new Date(data.summary.peakDay?.date || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Daily Average</p>
          <p className="text-[#f5f5f5] font-medium">
            {(data.summary.averageDailySignals + data.summary.averageDailyMentions).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SentimentChart({ data }: { data: any }) {
  const segments = [
    { label: 'Positive', value: data.percentages.positive, color: 'bg-green-500', icon: <Heart className="h-4 w-4" /> },
    { label: 'Neutral', value: data.percentages.neutral, color: 'bg-gray-500', icon: <Meh className="h-4 w-4" /> },
    { label: 'Negative', value: data.percentages.negative, color: 'bg-red-500', icon: <Frown className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-4">
      {/* Progress bars */}
      <div className="space-y-3">
        {segments.map((segment, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {segment.icon}
                <span className="text-[#f5f5f5]">{segment.label}</span>
              </div>
              <span className="text-[#a3a3a3]">{segment.value.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${segment.color} rounded-full transition-all duration-1000`}
                style={{ width: `${segment.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-white/5">
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Trend Direction</p>
          <p className={`font-medium ${
            data.trendDirection === 'positive' ? 'text-green-400' :
            data.trendDirection === 'negative' ? 'text-red-400' : 'text-[#a3a3a3]'
          }`}>
            {data.trendDirection.charAt(0).toUpperCase() + data.trendDirection.slice(1)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Confidence</p>
          <p className="text-[#f5f5f5] font-medium">
            {(data.avgConfidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}

function TagCloud({ tags }: { tags: any[] }) {
  const maxCount = Math.max(...tags.map(t => t.count));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 20).map((tag, index) => {
          const intensity = (tag.count / maxCount);
          const size = Math.max(0.75, intensity);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-all duration-200 hover:scale-105 ${
                tag.trending ?
                'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' :
                'bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10'
              }`}
              style={{ fontSize: `${size}rem` }}
            >
              {tag.trending && <Zap className="h-3 w-3" />}
              <span>{tag.tag}</span>
              <span className="text-[#666]">{tag.count}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-white/5">
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Most Popular</p>
          <p className="text-[#f5f5f5] font-medium">
            {tags[0]?.tag || 'None'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[#a3a3a3]">Trending Tags</p>
          <p className="text-yellow-300 font-medium">
            {tags.filter(t => t.trending).length}
          </p>
        </div>
      </div>
    </div>
  );
}

function SourceHealthGrid({ sources }: { sources: any[] }) {
  return (
    <div className="space-y-3">
      {sources.slice(0, 8).map((source, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${
              source.health === 'healthy' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#f5f5f5]">{source.name}</p>
              <p className="text-xs text-[#a3a3a3]">{source.type}</p>
            </div>
          </div>

          <div className="text-right space-y-1">
            <p className="text-sm text-[#f5f5f5]">{source.dailyMentions}</p>
            <p className="text-xs text-[#a3a3a3]">mentions/day</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DiagnosticsPanel({ diagnostics }: { diagnostics: any }) {
  const healthScore = diagnostics ? Math.round((
    (diagnostics.recommendations?.shouldClean ? 60 : 90) +
    (diagnostics.scannedCount > 0 ? 10 : 0)
  )) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${getScoreColor(healthScore)}`}>
          {healthScore}%
        </div>
        <p className="text-sm text-[#a3a3a3]">System Health Score</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide">Data Size</p>
          <p className="text-sm text-[#f5f5f5] font-medium">
            {diagnostics ? Math.round(diagnostics.averageSize / 1024) : 0}KB avg
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide">Documents</p>
          <p className="text-sm text-[#f5f5f5] font-medium">
            {diagnostics?.scannedCount || 0}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide">Large Files</p>
          <p className="text-sm text-[#f5f5f5] font-medium">
            {diagnostics?.sizeBuckets?.large || 0}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#a3a3a3] uppercase tracking-wide">Cleanup Needed</p>
          <p className={`text-sm font-medium ${
            diagnostics?.recommendations?.shouldClean ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {diagnostics?.recommendations?.shouldClean ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {diagnostics?.recommendations?.shouldClean && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-300 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Cleanup recommended</span>
          </div>
          <p className="text-xs text-[#a3a3a3] mt-1">
            Est. {Math.round((diagnostics.recommendations.estimatedSavings || 0) / 1024)}KB can be saved
          </p>
        </div>
      )}
    </div>
  );
}


function AnalyticsContent() {
  // Fetch analytics data - using existing API endpoints
  const dashboardStats = useQuery(api.metrics.getDashboardStats);
  const signalMetrics = useQuery(api.metrics.getSignalMetrics);
  const allSignals = useQuery<Signal[]>(api.signals.listSignals);
  const signalStats = useQuery(api.signals.getSignalStats);
  const sourceStats = useQuery(api.sources.getSourceStats);

  // Mock data for features that need full API implementation
  const velocityTrends = {
    trends: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      signals: Math.floor(Math.random() * 10) + 5,
      mentions: Math.floor(Math.random() * 50) + 20,
      velocity: Math.floor(Math.random() * 60) + 25,
      timestamp: Date.now() - (13 - i) * 24 * 60 * 60 * 1000
    })),
    summary: {
      totalSignals: dashboardStats?.totalSignals || 0,
      totalMentions: dashboardStats?.totalMentions || 0,
      averageDailySignals: (dashboardStats?.totalSignals || 0) / 30,
      averageDailyMentions: (dashboardStats?.totalMentions || 0) / 30,
      peakDay: { date: new Date().toISOString().split('T')[0], velocity: 80 },
      period: { days: 30, granularity: 'daily' }
    }
  };

  const sentimentDistribution = {
    distribution: { positive: 45, neutral: 35, negative: 20 },
    percentages: { positive: 45, neutral: 35, negative: 20 },
    total: 100,
    avgConfidence: 0.75,
    period: { days: 7 },
    trendDirection: 'positive' as const
  };

  const tagAnalysis = {
    tags: [
      { tag: 'ai', count: 25, frequency: 15.5, trending: true, signalIds: [], categories: [] },
      { tag: 'technology', count: 18, frequency: 11.2, trending: true, signalIds: [], categories: [] },
      { tag: 'innovation', count: 15, frequency: 9.3, trending: false, signalIds: [], categories: [] },
      { tag: 'automation', count: 12, frequency: 7.4, trending: true, signalIds: [], categories: [] },
      { tag: 'data', count: 10, frequency: 6.2, trending: false, signalIds: [], categories: [] },
      { tag: 'digital', count: 8, frequency: 4.9, trending: false, signalIds: [], categories: [] },
      { tag: 'future', count: 7, frequency: 4.3, trending: true, signalIds: [], categories: [] }
    ]
  };

  const sourceMetrics = {
    sources: Array.from({ length: 8 }, (_, i) => ({
      sourceId: `source-${i}`,
      name: `Source ${i + 1}`,
      type: i % 2 === 0 ? 'RSS' : 'API',
      isActive: i < 6,
      totalMentions: Math.floor(Math.random() * 100) + 20,
      weeklyMentions: Math.floor(Math.random() * 30) + 5,
      dailyMentions: Math.floor(Math.random() * 10) + 1,
      avgContentLength: Math.floor(Math.random() * 2000) + 500,
      lastSync: Date.now() - (i * 3600000),
      errorCount: Math.floor(Math.random() * 3),
      successRate: 0.85 + Math.random() * 0.15,
      velocity: Math.floor(Math.random() * 10) + 1,
      health: i < 6 && Math.random() > 0.3 ? 'healthy' as const : 'needs_attention' as const
    })),
    summary: {
      totalSources: 8,
      activeSources: 6,
      totalMentions: 500,
      avgMentionsPerSource: 62.5,
      healthySources: 5
    }
  };

  const diagnostics = {
    scannedCount: 150,
    averageSize: 2500,
    sizeBuckets: { small: 120, medium: 25, large: 4, xlarge: 1 },
    recommendations: { shouldClean: false, estimatedSavings: 0 }
  };

  const documentCounts = {
    personalDocuments: { total: 45, recent: 8, daily: 2 },
    newsletters: { total: 12, published: 8, scheduled: 2, draft: 2 },
    contentDrafts: { total: 23, recent: 5 },
    templates: { total: 15, active: 12 },
    lastUpdated: Date.now()
  };

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!dashboardStats || !signalMetrics) {
    return <LoadingScreen />;
  }

  // Calculate trends and growth rates
  const signalGrowth = Math.random() * 20 - 10; // Mock growth between -10% and +10%
  const mentionGrowth = Math.random() * 30 - 15; // Mock growth between -15% and +15%

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <BarChart3 className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-[#a3a3a3]">Comprehensive system metrics and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Signals"
          value={dashboardStats.totalSignals}
          change={signalGrowth}
          trend={signalGrowth > 0 ? 'up' : signalGrowth < 0 ? 'down' : 'neutral'}
          icon={<Activity className="h-6 w-6 text-purple-400" />}
          subtitle="Active monitoring"
          color="purple"
        />
        <MetricCard
          title="Mentions Analyzed"
          value={dashboardStats.totalMentions}
          change={mentionGrowth}
          trend={mentionGrowth > 0 ? 'up' : mentionGrowth < 0 ? 'down' : 'neutral'}
          icon={<MessageSquare className="h-6 w-6 text-blue-400" />}
          subtitle="From all sources"
          color="blue"
        />
        <MetricCard
          title="Data Sources"
          value={sourceMetrics.summary.totalSources}
          icon={<Database className="h-6 w-6 text-green-400" />}
          subtitle={`${sourceMetrics.summary.activeSources} active`}
          color="green"
        />
        <MetricCard
          title="System Health"
          value={`${Math.round((diagnostics.recommendations.shouldClean ? 60 : 90) + (diagnostics.scannedCount > 0 ? 10 : 0))}%`}
          icon={<Gauge className="h-6 w-6 text-yellow-400" />}
          subtitle="Overall performance"
          color="yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Trends */}
        <Card className="glass bg-[#0a0a0a]/80 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              Velocity Trends
            </CardTitle>
            <p className="text-sm text-[#a3a3a3]">Signal and mention activity over time</p>
          </CardHeader>
          <CardContent>
            <VelocityChart data={velocityTrends} />
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="glass bg-[#0a0a0a]/80 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
              <Heart className="h-5 w-5 text-green-400" />
              Sentiment Analysis
            </CardTitle>
            <p className="text-sm text-[#a3a3a3]">Recent mention sentiment distribution</p>
          </CardHeader>
          <CardContent>
            <SentimentChart data={sentimentDistribution} />
          </CardContent>
        </Card>

        {/* Tag Analysis */}
        <Card className="glass bg-[#0a0a0a]/80 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
              <Tag className="h-5 w-5 text-yellow-400" />
              Tag Cloud
            </CardTitle>
            <p className="text-sm text-[#a3a3a3]">Most frequent topics and keywords</p>
          </CardHeader>
          <CardContent>
            <TagCloud tags={tagAnalysis.tags} />
          </CardContent>
        </Card>

        {/* Source Health */}
        <Card className="glass bg-[#0a0a0a]/80 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
              <Server className="h-5 w-5 text-blue-400" />
              Source Health
            </CardTitle>
            <p className="text-sm text-[#a3a3a3]">Data source performance and activity</p>
          </CardHeader>
          <CardContent>
            <SourceHealthGrid sources={sourceMetrics.sources} />
          </CardContent>
        </Card>
      </div>

      {/* Performance Diagnostics */}
      <Card className="glass bg-[#0a0a0a]/80 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
            <HardDrive className="h-5 w-5 text-red-400" />
            Performance Diagnostics
          </CardTitle>
          <p className="text-sm text-[#a3a3a3]">System health and optimization recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* System Health */}
            <div>
              <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">System Health</h4>
              <DiagnosticsPanel diagnostics={diagnostics} />
            </div>

            {/* Document Statistics */}
            <div>
              <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Document Stats</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-sm text-[#a3a3a3]">Personal Docs</span>
                  <span className="text-sm text-[#f5f5f5] font-medium">{documentCounts.personalDocuments.total}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-sm text-[#a3a3a3]">Newsletters</span>
                  <span className="text-sm text-[#f5f5f5] font-medium">{documentCounts.newsletters.total}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-sm text-[#a3a3a3]">Content Drafts</span>
                  <span className="text-sm text-[#f5f5f5] font-medium">{documentCounts.contentDrafts.total}</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-white/5">
                  <span className="text-sm text-[#a3a3a3]">Templates</span>
                  <span className="text-sm text-[#f5f5f5] font-medium">{documentCounts.templates.total}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      sourceMetrics.summary.healthySources > sourceMetrics.summary.totalSources * 0.8 ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-sm text-[#a3a3a3]">Sources</span>
                  </div>
                  <span className="text-sm text-[#f5f5f5] font-medium">
                    {Math.round((sourceMetrics.summary.healthySources / sourceMetrics.summary.totalSources) * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      sentimentDistribution.percentages.positive > 40 ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-sm text-[#a3a3a3]">Sentiment</span>
                  </div>
                  <span className="text-sm text-[#f5f5f5] font-medium">
                    {sentimentDistribution.trendDirection}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      !diagnostics.recommendations.shouldClean ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm text-[#a3a3a3]">Storage</span>
                  </div>
                  <span className="text-sm text-[#f5f5f5] font-medium">
                    {diagnostics.recommendations.shouldClean ? 'Needs Cleanup' : 'Optimal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card className="glass bg-[#0a0a0a]/80 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#f5f5f5]">
            <Eye className="h-5 w-5 text-green-400" />
            Real-time Activity
          </CardTitle>
          <p className="text-sm text-[#a3a3a3]">Live system activity and updates</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock activity items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-2 rounded bg-green-500/10 border border-green-500/20"
            >
              <CheckCircle className="h-4 w-4 text-green-400" />
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f5]">Source sync completed</p>
                <p className="text-xs text-[#a3a3a3]">{sourceMetrics.summary.totalMentions} mentions processed</p>
              </div>
              <span className="text-xs text-[#a3a3a3]">Just now</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-2 rounded bg-purple-500/10 border border-purple-500/20"
            >
              <Activity className="h-4 w-4 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm text-[#f5f5f5]">New signals detected</p>
                <p className="text-xs text-[#a3a3a3]">{signalMetrics?.total || dashboardStats.totalSignals} signals now active</p>
              </div>
              <span className="text-xs text-[#a3a3a3]">2m ago</span>
            </motion.div>

            {diagnostics.recommendations.shouldClean && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-2 rounded bg-yellow-500/10 border border-yellow-500/20"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm text-[#f5f5f5]">Storage optimization available</p>
                  <p className="text-xs text-[#a3a3a3]">{Math.round(diagnostics.recommendations.estimatedSavings / 1024)}KB can be freed</p>
                </div>
                <span className="text-xs text-[#a3a3a3]">5m ago</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-hidden transition-all duration-300",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <Suspense fallback={<LoadingScreen />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}