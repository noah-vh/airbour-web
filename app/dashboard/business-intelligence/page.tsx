"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Info,
  Building2,
  MapPin,
  Clock,
  Zap,
  Shield,
  Award,
  Search,
  Filter,
  Mail,
  Share2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { mockBusinessData } from "./mock-data";

export default function BusinessIntelligencePage() {
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"90d" | "1y" | "3y" | "10y">("1y");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = (type: string) => {
    toast.success(`${type} export initiated! Check your email in a few minutes.`);
  };

  const filteredCompetitors = mockBusinessData.competitors.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-4xl font-bold tracking-tight text-[#f5f5f5]">
              Business Intelligence
            </h1>
            <p className="mt-2 text-lg text-[#a3a3a3]">
              Strategic insights for the Chicago Taco Shop catering pivot
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport("Full Report")}
              className="glass glass-blue hover:scale-105 transition-transform"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("Executive Summary")}
              className="glass hover:scale-105 transition-transform"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Summary
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mt-6">
          {mockBusinessData.keyMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass glass-purple p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a3a3a3]">{metric.label}</p>
                  <p className="text-2xl font-bold text-[#f5f5f5] mt-1">{metric.value}</p>
                  <p className="text-xs text-green-400 mt-1">{metric.change}</p>
                </div>
                <metric.icon className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="competitive" className="space-y-6">
        <TabsList className="glass w-full justify-start">
          <TabsTrigger value="competitive" className="data-[state=active]:bg-purple-500/20">
            <Briefcase className="h-4 w-4 mr-2" />
            Competitive Analysis
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-purple-500/20">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Intelligence
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-purple-500/20">
            <Users className="h-4 w-4 mr-2" />
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="strategy" className="data-[state=active]:bg-purple-500/20">
            <Target className="h-4 w-4 mr-2" />
            Strategic Planning
          </TabsTrigger>
        </TabsList>

        {/* Competitive Analysis Tab */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="glass glass-blue p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#f5f5f5]">Competitor Landscape</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search competitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm" className="glass">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredCompetitors.map((competitor) => (
                <motion.div
                  key={competitor.id}
                  layout
                  className="border border-white/10 rounded-lg p-4 hover:border-purple-500/30 transition-colors"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setExpandedCompetitor(
                        expandedCompetitor === competitor.id ? null : competitor.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-[#f5f5f5]">{competitor.name}</h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              competitor.threat === "high"
                                ? "bg-red-500/20 text-red-400"
                                : competitor.threat === "medium"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            )}
                          >
                            {competitor.threat} threat
                          </Badge>
                        </div>
                        <p className="text-sm text-[#a3a3a3] mt-1">{competitor.description}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-[#a3a3a3]">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {competitor.location}
                          </span>
                          <span className="text-xs text-[#a3a3a3]">
                            <Building2 className="h-3 w-3 inline mr-1" />
                            {competitor.size}
                          </span>
                          <span className="text-xs text-[#a3a3a3]">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            {competitor.priceRange}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedCompetitor === competitor.id ? (
                          <ChevronUp className="h-5 w-5 text-[#a3a3a3]" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-[#a3a3a3]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCompetitor === competitor.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-white/5"
                      >
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">
                              Target Customers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {competitor.targetCustomers.map((customer) => (
                                <Badge key={customer} variant="outline" className="text-xs">
                                  {customer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">
                              Key Differentiators
                            </h4>
                            <ul className="space-y-1">
                              {competitor.differentiators.map((diff) => (
                                <li key={diff} className="text-xs text-[#a3a3a3] flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-400 mr-2 shrink-0" />
                                  {diff}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Operational Patterns */}
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">
                            Operational Advantages We Should Match
                          </h4>
                          <div className="grid md:grid-cols-3 gap-3">
                            {competitor.operationalPatterns.map((pattern) => (
                              <div
                                key={pattern}
                                className="glass p-3 rounded-lg flex items-center gap-2"
                              >
                                <Zap className="h-4 w-4 text-yellow-400" />
                                <span className="text-xs text-[#f5f5f5]">{pattern}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link href="/dashboard/signals">
                            <Button size="sm" variant="outline" className="text-xs">
                              View Related Signals
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleExport(`${competitor.name} Analysis`)}
                          >
                            Export Analysis
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Competitive Positioning Map */}
            <div className="mt-6 glass glass-purple p-6 rounded-lg">
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Market Positioning</h3>
              <div className="relative h-64 border border-white/10 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#a3a3a3] text-sm">Price →</span>
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg]">
                  <span className="text-[#a3a3a3] text-sm">Quality →</span>
                </div>
                {/* Plot competitors on the map */}
                {filteredCompetitors.map((comp, idx) => (
                  <div
                    key={comp.id}
                    className={cn(
                      "absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      comp.threat === "high" ? "bg-red-500" :
                      comp.threat === "medium" ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{
                      left: `${20 + (idx * 20)}%`,
                      top: `${30 + (idx * 15)}%`,
                    }}
                    title={comp.name}
                  >
                    {comp.name.charAt(0)}
                  </div>
                ))}
                <div
                  className="absolute w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-sm font-bold animate-pulse"
                  style={{ left: "60%", top: "40%" }}
                  title="Chicago Taco Shop (Target)"
                >
                  US
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Our Target Position
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  High Threat
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  Medium Threat
                </span>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-6 glass glass-orange p-6 rounded-lg">
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">
                Competitive Intelligence Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#f5f5f5] font-medium">Critical Gap: One-Button Ordering</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      4 out of 5 competitors offer streamlined ordering. This is now table stakes in the catering market.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#f5f5f5] font-medium">Unique Advantage: Authentic Mexican Heritage</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Only competitor with genuine family recipes and cultural authenticity story.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#f5f5f5] font-medium">Opportunity: Corporate Lunch Market</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      Only 2 competitors actively targeting financial services. Clear opening for premium positioning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Pricing Intelligence Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="glass glass-green p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Pricing Analysis</h2>

            {/* Pricing Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#a3a3a3]">Service</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#a3a3a3]">Chicago Taco (Current)</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#a3a3a3]">Market Average</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#a3a3a3]">Premium Leader</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-[#a3a3a3]">Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBusinessData.pricingComparison.map((item) => (
                    <tr key={item.service} className="border-b border-white/5">
                      <td className="py-3 px-4 text-sm text-[#f5f5f5]">{item.service}</td>
                      <td className="text-center py-3 px-4 text-sm text-[#f5f5f5]">{item.current}</td>
                      <td className="text-center py-3 px-4 text-sm text-[#a3a3a3]">{item.marketAvg}</td>
                      <td className="text-center py-3 px-4 text-sm text-[#a3a3a3]">{item.premium}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {item.recommendation}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Value Proposition Analysis */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="glass p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#f5f5f5] mb-3">Revenue Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#a3a3a3]">Current Monthly Revenue</span>
                    <span className="text-sm font-medium text-[#f5f5f5]">$32,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#a3a3a3]">With Recommended Pricing</span>
                    <span className="text-sm font-medium text-green-400">$41,600</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#a3a3a3]">Monthly Increase</span>
                    <span className="text-sm font-bold text-green-400">+$9,600 (30%)</span>
                  </div>
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <h3 className="text-lg font-medium text-[#f5f5f5] mb-3">Implementation Risk</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-[#f5f5f5]">Low customer churn risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-sm text-[#f5f5f5]">Moderate competitive response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-sm text-[#f5f5f5]">Strong value justification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Strategy Recommendations */}
            <div className="mt-6 glass glass-blue p-6 rounded-lg">
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Strategic Recommendations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">Quick Wins (30 days)</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Add $75 setup service fee
                    </li>
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Increase delivery fee to $40
                    </li>
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Raise per-person pricing by $2-3
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">Long-term (90 days)</h4>
                  <ul className="space-y-1">
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Launch premium tier at $35/person
                    </li>
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Implement value-based pricing model
                    </li>
                    <li className="text-xs text-[#a3a3a3] flex items-center">
                      <ArrowRight className="h-3 w-3 text-blue-400 mr-2 shrink-0" />
                      Corporate contract pricing strategy
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="glass glass-orange p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-[#f5f5f5] mb-4">Customer Intelligence</h2>

            {/* Customer Journey */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Customer Journey Analysis</h3>
              <div className="grid md:grid-cols-6 gap-4">
                {mockBusinessData.customerJourney.map((stage, idx) => (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <div className="glass p-4 rounded-lg mb-2">
                      <stage.icon className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                      <h4 className="text-sm font-medium text-[#f5f5f5]">{stage.stage}</h4>
                      <div className="mt-2">
                        <div className="text-xs text-[#a3a3a3] mb-1">Satisfaction</div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1 h-3 rounded",
                                i < stage.satisfaction ? "bg-orange-400" : "bg-white/10"
                              )}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-orange-400 mt-1">{stage.satisfaction}/10</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {stage.painPoints.map((pain) => (
                        <div key={pain} className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                          {pain}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Themes */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Key Customer Themes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mockBusinessData.customerInsights.themes.map((theme) => (
                  <motion.div
                    key={theme.theme}
                    whileHover={{ scale: 1.02 }}
                    className="glass p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-[#f5f5f5]">{theme.theme}</h4>
                      <Badge
                        className={cn(
                          "text-xs",
                          theme.sentiment === "positive"
                            ? "bg-green-500/20 text-green-400"
                            : theme.sentiment === "negative"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        )}
                      >
                        {theme.frequency}% mention
                      </Badge>
                    </div>
                    <p className="text-xs text-[#a3a3a3]">{theme.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Customer Quotes */}
            <div>
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Customer Voice</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mockBusinessData.customerInsights.quotes.map((quote, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-4 rounded-lg"
                  >
                    <div className="mb-3">
                      <Badge className="bg-blue-500/20 text-blue-400 text-xs mb-2">
                        {quote.category}
                      </Badge>
                      <blockquote className="text-sm text-[#f5f5f5] italic">
                        "{quote.text}"
                      </blockquote>
                    </div>
                    <div className="text-xs text-[#a3a3a3]">
                      <div className="font-medium">{quote.source}</div>
                      <div>{quote.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Strategic Planning Tab */}
        <TabsContent value="strategy" className="space-y-6">
          <div className="glass glass-purple p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#f5f5f5]">Strategic Roadmap</h2>
              <div className="flex gap-2">
                {(["90d", "1y", "3y", "10y"] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "text-xs",
                      selectedTimeframe === timeframe && "bg-purple-500/20"
                    )}
                  >
                    {timeframe.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {mockBusinessData.strategicPlan
                .filter(plan => plan.timeframe === selectedTimeframe)
                .map((plan, idx) => (
                  <motion.div
                    key={plan.goal}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass p-6 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[#f5f5f5] mb-1">{plan.goal}</h3>
                        <p className="text-sm text-[#a3a3a3]">{plan.target}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#f5f5f5]">{plan.progress}%</div>
                        <Progress value={plan.progress} className="w-24 mt-1" />
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Key Milestones</h4>
                        <div className="space-y-2">
                          {plan.milestones.map((milestone) => (
                            <div key={milestone.title} className="flex items-center gap-3">
                              <div className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center",
                                milestone.completed ? "bg-green-500" : "bg-white/10"
                              )}>
                                {milestone.completed && (
                                  <CheckCircle className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className={cn(
                                "text-sm",
                                milestone.completed ? "text-green-400" : "text-[#a3a3a3]"
                              )}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      {plan.metrics && (
                        <div>
                          <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Target Metrics</h4>
                          <div className="space-y-2">
                            {Object.entries(plan.metrics).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm text-[#a3a3a3] capitalize">{key}:</span>
                                <span className="text-sm text-[#f5f5f5] font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* 90-Day Action Plan */}
            {selectedTimeframe === "90d" && (
              <div className="mt-6 glass glass-green p-6 rounded-lg">
                <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">90-Day Action Plan</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Weeks 1-6 (Foundation)</h4>
                    <div className="space-y-2">
                      {mockBusinessData.ninetyDayActions
                        .filter(action => parseInt(action.week.replace('W', '')) <= 6)
                        .map((action) => (
                          <div key={action.id} className="flex items-start gap-3">
                            <Badge
                              className={cn(
                                "text-xs shrink-0",
                                action.priority === "high"
                                  ? "bg-red-500/20 text-red-400"
                                  : action.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              )}
                            >
                              {action.week}
                            </Badge>
                            <div className="flex-1">
                              <div className="text-sm text-[#f5f5f5]">{action.action}</div>
                              <div className="text-xs text-[#a3a3a3]">{action.owner}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#f5f5f5] mb-3">Weeks 7-12 (Growth)</h4>
                    <div className="space-y-2">
                      {mockBusinessData.ninetyDayActions
                        .filter(action => parseInt(action.week.replace('W', '')) > 6)
                        .map((action) => (
                          <div key={action.id} className="flex items-start gap-3">
                            <Badge
                              className={cn(
                                "text-xs shrink-0",
                                action.priority === "high"
                                  ? "bg-red-500/20 text-red-400"
                                  : action.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-green-500/20 text-green-400"
                              )}
                            >
                              {action.week}
                            </Badge>
                            <div className="flex-1">
                              <div className="text-sm text-[#f5f5f5]">{action.action}</div>
                              <div className="text-xs text-[#a3a3a3]">{action.owner}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Success Metrics */}
          <div className="glass glass-blue p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#f5f5f5] mb-4">Success Metrics Dashboard</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">$10M</div>
                <div className="text-sm text-[#a3a3a3]">10-Year Revenue Target</div>
                <div className="mt-2">
                  <Progress value={2} className="h-2" />
                  <div className="text-xs text-[#a3a3a3] mt-1">2% complete</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">30</div>
                <div className="text-sm text-[#a3a3a3]">Days to First Corporate Contract</div>
                <div className="mt-2">
                  <Progress value={67} className="h-2" />
                  <div className="text-xs text-green-400 mt-1">On track</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">5</div>
                <div className="text-sm text-[#a3a3a3]">Cities by Year 3</div>
                <div className="mt-2">
                  <Progress value={20} className="h-2" />
                  <div className="text-xs text-purple-400 mt-1">Early stage</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}