"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Analyze performance of a single newsletter
export const analyzePerformance = action({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    // Fetch newsletter
    const newsletter = await ctx.runQuery(api.newsletters.get, {
      id: args.newsletterId,
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Fetch email events for this newsletter
    const events = await ctx.runQuery(api.emailEvents.getByNewsletter, {
      newsletterId: args.newsletterId,
    });

    // Calculate base metrics
    const sentCount = events.filter((e: any) => e.eventType === "sent").length;
    const openedEvents = events.filter((e: any) => e.eventType === "opened");
    const clickedEvents = events.filter((e: any) => e.eventType === "clicked");

    const uniqueOpens = new Set(openedEvents.map((e: any) => e.subscriberId)).size;
    const uniqueClicks = new Set(clickedEvents.map((e: any) => e.subscriberId)).size;

    const openRate = sentCount > 0 ? (uniqueOpens / sentCount) * 100 : 0;
    const clickRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;

    // Analyze click patterns by URL (correlate with sections)
    const clicksByUrl: Record<string, number> = {};
    for (const event of clickedEvents) {
      const url = event.metadata?.url || "unknown";
      clicksByUrl[url] = (clicksByUrl[url] || 0) + 1;
    }

    // Analyze section performance based on click patterns
    const sectionInsights: Array<{
      sectionId: string;
      sectionType: string;
      sectionTitle: string;
      clickCount: number;
      clickRate: number;
      insight: string;
    }> = [];

    if (newsletter.sections && Array.isArray(newsletter.sections)) {
      const avgClicksPerSection = Object.values(clicksByUrl).reduce((a, b) => a + b, 0) / (newsletter.sections.length || 1);

      for (const section of newsletter.sections) {
        // Match clicks to sections (simplified: assumes URLs contain section identifiers)
        const sectionClicks = Object.entries(clicksByUrl)
          .filter(([url]) => url.includes(section.id) || url.includes(section.type))
          .reduce((sum, [, count]) => sum + count, 0);

        const sectionClickRate = uniqueOpens > 0 ? (sectionClicks / uniqueOpens) * 100 : 0;
        const performanceRatio = avgClicksPerSection > 0 ? sectionClicks / avgClicksPerSection : 1;

        let insight = "";
        if (performanceRatio > 1.5) {
          insight = `High performer: ${section.title} had ${performanceRatio.toFixed(1)}x higher engagement than average`;
        } else if (performanceRatio < 0.5) {
          insight = `Underperforming: ${section.title} had ${((1 - performanceRatio) * 100).toFixed(0)}% less engagement than average`;
        } else {
          insight = `Average performance for ${section.title}`;
        }

        sectionInsights.push({
          sectionId: section.id,
          sectionType: section.type,
          sectionTitle: section.title,
          clickCount: sectionClicks,
          clickRate: sectionClickRate,
          insight,
        });
      }
    }

    // Time-based analysis
    const openTimestamps = openedEvents.map((e: any) => e.timestamp);
    const clickTimestamps = clickedEvents.map((e: any) => e.timestamp);

    let peakOpenHour = null;
    let peakClickHour = null;

    if (openTimestamps.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const ts of openTimestamps) {
        const hour = new Date(ts).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
      peakOpenHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    if (clickTimestamps.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const ts of clickTimestamps) {
        const hour = new Date(ts).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
      peakClickHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    }

    return {
      newsletterId: args.newsletterId,
      title: newsletter.title,
      subject: newsletter.subject,
      metrics: {
        sent: sentCount,
        uniqueOpens,
        uniqueClicks,
        openRate: parseFloat(openRate.toFixed(2)),
        clickRate: parseFloat(clickRate.toFixed(2)),
      },
      sectionInsights,
      temporalInsights: {
        peakOpenHour: peakOpenHour ? parseInt(peakOpenHour) : null,
        peakClickHour: peakClickHour ? parseInt(peakClickHour) : null,
      },
      clicksByUrl,
    };
  },
});

// Suggest improvements based on multiple newsletters' performance
export const suggestImprovements = action({
  args: {
    newsletterIds: v.optional(v.array(v.id("newsletters"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch newsletters - either specified or most recent
    let newsletters: any[];

    if (args.newsletterIds && args.newsletterIds.length > 0) {
      newsletters = await Promise.all(
        args.newsletterIds.map((id) => ctx.runQuery(api.newsletters.get, { id }))
      );
    } else {
      newsletters = await ctx.runQuery(api.newsletters.list, {
        status: "sent",
        limit: args.limit || 10,
      });
    }

    newsletters = newsletters.filter(Boolean);

    if (newsletters.length === 0) {
      return {
        success: false,
        error: "No newsletters found to analyze",
        recommendations: [],
      };
    }

    // Gather performance data for each newsletter
    const performanceData = await Promise.all(
      newsletters.map(async (nl) => {
        const stats = await ctx.runQuery(api.emailEvents.getNewsletterStats, {
          newsletterId: nl._id,
        });
        return {
          id: nl._id,
          title: nl.title,
          subject: nl.subject,
          sections: nl.sections || [],
          openRate: parseFloat(stats.openRate),
          clickRate: parseFloat(stats.clickRate),
          sent: stats.sent,
        };
      })
    );

    // Identify high performers (top 25%)
    const sortedByOpenRate = [...performanceData].sort((a, b) => b.openRate - a.openRate);
    const sortedByClickRate = [...performanceData].sort((a, b) => b.clickRate - a.clickRate);

    const highOpenPerformers = sortedByOpenRate.slice(0, Math.max(1, Math.floor(sortedByOpenRate.length * 0.25)));
    const highClickPerformers = sortedByClickRate.slice(0, Math.max(1, Math.floor(sortedByClickRate.length * 0.25)));

    // Build analysis context for AI
    const analysisContext = `
Newsletter Performance Analysis:

Total newsletters analyzed: ${performanceData.length}

Open Rate Statistics:
- Average: ${(performanceData.reduce((sum, n) => sum + n.openRate, 0) / performanceData.length).toFixed(1)}%
- Best: ${sortedByOpenRate[0]?.openRate.toFixed(1)}% (${sortedByOpenRate[0]?.title})
- Worst: ${sortedByOpenRate[sortedByOpenRate.length - 1]?.openRate.toFixed(1)}%

Click Rate Statistics:
- Average: ${(performanceData.reduce((sum, n) => sum + n.clickRate, 0) / performanceData.length).toFixed(1)}%
- Best: ${sortedByClickRate[0]?.clickRate.toFixed(1)}% (${sortedByClickRate[0]?.title})

High Performing Subject Lines:
${highOpenPerformers.map((n) => `- "${n.subject}" (${n.openRate.toFixed(1)}% open rate)`).join("\n")}

High Click-Through Newsletters:
${highClickPerformers.map((n) => `- "${n.title}" (${n.clickRate.toFixed(1)}% CTR)`).join("\n")}

Section Types in High Performers:
${highClickPerformers.flatMap((n) => n.sections.map((s: any) => s.type)).join(", ")}
    `;

    // Call OpenRouter API for AI-generated recommendations
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured in Convex environment");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "SysInno Innovation Platform",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You are a newsletter optimization expert. Analyze performance data and provide actionable recommendations to improve engagement.",
          },
          {
            role: "user",
            content: `Based on this newsletter performance data, provide 5-7 specific, actionable recommendations to improve future newsletters:

${analysisContext}

Format your response as a JSON array of objects with fields: "category" (subject_line, content, timing, structure, or engagement), "recommendation" (the specific advice), "priority" (high, medium, low), "expectedImpact" (percentage improvement estimate).`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // Parse AI response
    let recommendations: any[] = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, return raw recommendations
      recommendations = [
        {
          category: "general",
          recommendation: aiContent,
          priority: "medium",
          expectedImpact: "varies",
        },
      ];
    }

    return {
      success: true,
      analyzedNewsletters: performanceData.length,
      averageOpenRate: (performanceData.reduce((sum, n) => sum + n.openRate, 0) / performanceData.length).toFixed(1),
      averageClickRate: (performanceData.reduce((sum, n) => sum + n.clickRate, 0) / performanceData.length).toFixed(1),
      recommendations,
      topPerformers: {
        byOpenRate: highOpenPerformers.slice(0, 3).map((n) => ({ title: n.title, openRate: n.openRate })),
        byClickRate: highClickPerformers.slice(0, 3).map((n) => ({ title: n.title, clickRate: n.clickRate })),
      },
    };
  },
});

// Optimize subject lines using AI
export const optimizeSubjectLines = action({
  args: {
    subjectLines: v.array(
      v.object({
        subject: v.string(),
        openRate: v.number(),
      })
    ),
    targetAudience: v.optional(v.string()),
    newsletterTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.subjectLines.length === 0) {
      return {
        success: false,
        error: "No subject lines provided for analysis",
        suggestions: [],
      };
    }

    // Sort by performance to identify patterns
    const sorted = [...args.subjectLines].sort((a, b) => b.openRate - a.openRate);
    const avgOpenRate = args.subjectLines.reduce((sum, s) => sum + s.openRate, 0) / args.subjectLines.length;

    const analysisContext = `
Subject Line Performance Data:

Best Performers:
${sorted
  .slice(0, 3)
  .map((s) => `- "${s.subject}" (${s.openRate.toFixed(1)}% open rate)`)
  .join("\n")}

Worst Performers:
${sorted
  .slice(-3)
  .map((s) => `- "${s.subject}" (${s.openRate.toFixed(1)}% open rate)`)
  .join("\n")}

Average Open Rate: ${avgOpenRate.toFixed(1)}%
Total Analyzed: ${args.subjectLines.length}

${args.targetAudience ? `Target Audience: ${args.targetAudience}` : ""}
${args.newsletterTopic ? `Newsletter Topic: ${args.newsletterTopic}` : ""}
    `;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured in Convex environment");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "SysInno Innovation Platform",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You are an email subject line optimization expert. Analyze patterns in successful subject lines and generate optimized alternatives that are likely to achieve higher open rates.",
          },
          {
            role: "user",
            content: `Analyze these subject line performance patterns and generate 5 optimized subject line suggestions:

${analysisContext}

For each suggestion, provide:
1. The subject line
2. Why it should perform well (based on patterns)
3. Predicted open rate improvement percentage

Format as JSON array with fields: "subject", "rationale", "predictedImprovement" (number, percentage points above average).`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // Parse suggestions
    let suggestions: any[] = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      suggestions = [
        {
          subject: "Unable to parse AI suggestions",
          rationale: aiContent,
          predictedImprovement: 0,
        },
      ];
    }

    // Rank by predicted improvement
    suggestions.sort((a, b) => (b.predictedImprovement || 0) - (a.predictedImprovement || 0));

    return {
      success: true,
      currentAverageOpenRate: parseFloat(avgOpenRate.toFixed(1)),
      bestPerformingPattern: sorted[0]?.subject || null,
      suggestions: suggestions.map((s, i) => ({
        rank: i + 1,
        subject: s.subject,
        rationale: s.rationale,
        predictedOpenRate: parseFloat((avgOpenRate + (s.predictedImprovement || 0)).toFixed(1)),
        predictedImprovement: s.predictedImprovement || 0,
      })),
      patternsIdentified: {
        bestPerformers: sorted.slice(0, 3).map((s) => s.subject),
        averageLength: Math.round(args.subjectLines.reduce((sum, s) => sum + s.subject.length, 0) / args.subjectLines.length),
      },
    };
  },
});

// Adjust signal weights based on engagement correlation
export const adjustSignalWeights = action({
  args: {
    newsletterIds: v.optional(v.array(v.id("newsletters"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetch newsletters with their signals and performance
    let newsletters: any[];

    if (args.newsletterIds && args.newsletterIds.length > 0) {
      newsletters = await Promise.all(
        args.newsletterIds.map((id) => ctx.runQuery(api.newsletters.get, { id }))
      );
    } else {
      newsletters = await ctx.runQuery(api.newsletters.list, {
        status: "sent",
        limit: args.limit || 20,
      });
    }

    newsletters = newsletters.filter(Boolean);

    if (newsletters.length === 0) {
      return {
        success: false,
        error: "No newsletters found to analyze",
        weightRecommendations: [],
      };
    }

    // Collect signal performance data
    const signalPerformance: Record<
      string,
      {
        signalId: string;
        appearances: number;
        totalOpenRate: number;
        totalClickRate: number;
        categories: string[];
      }
    > = {};

    for (const nl of newsletters) {
      const stats = await ctx.runQuery(api.emailEvents.getNewsletterStats, {
        newsletterId: nl._id,
      });

      const openRate = parseFloat(stats.openRate);
      const clickRate = parseFloat(stats.clickRate);

      // Track signals from newsletter sections
      const signalIds = nl.sourceSignalIds || [];
      for (const section of nl.sections || []) {
        if (section.signalIds) {
          signalIds.push(...section.signalIds);
        }
      }

      // Fetch signal details and correlate with performance
      for (const signalId of signalIds) {
        const idStr = signalId.toString();
        if (!signalPerformance[idStr]) {
          try {
            const signal = await ctx.runQuery(api.signals.getSignal, { id: signalId });
            signalPerformance[idStr] = {
              signalId: idStr,
              appearances: 0,
              totalOpenRate: 0,
              totalClickRate: 0,
              categories: signal?.steep || [],
            };
          } catch {
            signalPerformance[idStr] = {
              signalId: idStr,
              appearances: 0,
              totalOpenRate: 0,
              totalClickRate: 0,
              categories: [],
            };
          }
        }

        signalPerformance[idStr].appearances++;
        signalPerformance[idStr].totalOpenRate += openRate;
        signalPerformance[idStr].totalClickRate += clickRate;
      }
    }

    // Calculate average performance per signal
    const signalStats = Object.values(signalPerformance).map((sp) => ({
      signalId: sp.signalId,
      appearances: sp.appearances,
      avgOpenRate: sp.appearances > 0 ? sp.totalOpenRate / sp.appearances : 0,
      avgClickRate: sp.appearances > 0 ? sp.totalClickRate / sp.appearances : 0,
      categories: sp.categories,
    }));

    // Aggregate by STEEP category
    const categoryPerformance: Record<
      string,
      {
        category: string;
        signalCount: number;
        totalOpenRate: number;
        totalClickRate: number;
      }
    > = {};

    for (const stat of signalStats) {
      for (const category of stat.categories) {
        if (!categoryPerformance[category]) {
          categoryPerformance[category] = {
            category,
            signalCount: 0,
            totalOpenRate: 0,
            totalClickRate: 0,
          };
        }
        categoryPerformance[category].signalCount++;
        categoryPerformance[category].totalOpenRate += stat.avgOpenRate;
        categoryPerformance[category].totalClickRate += stat.avgClickRate;
      }
    }

    // Calculate category weights
    const categoryStats = Object.values(categoryPerformance).map((cp) => ({
      category: cp.category,
      signalCount: cp.signalCount,
      avgOpenRate: cp.signalCount > 0 ? cp.totalOpenRate / cp.signalCount : 0,
      avgClickRate: cp.signalCount > 0 ? cp.totalClickRate / cp.signalCount : 0,
    }));

    // Sort by combined performance score
    categoryStats.sort((a, b) => {
      const scoreA = a.avgOpenRate * 0.4 + a.avgClickRate * 0.6;
      const scoreB = b.avgOpenRate * 0.4 + b.avgClickRate * 0.6;
      return scoreB - scoreA;
    });

    // Generate weight recommendations (normalize to sum to 1)
    const totalScore = categoryStats.reduce((sum, c) => sum + c.avgOpenRate * 0.4 + c.avgClickRate * 0.6, 0);

    const weightRecommendations = categoryStats.map((c, i) => {
      const performanceScore = c.avgOpenRate * 0.4 + c.avgClickRate * 0.6;
      const recommendedWeight = totalScore > 0 ? performanceScore / totalScore : 1 / categoryStats.length;

      return {
        rank: i + 1,
        category: c.category,
        currentSignalCount: c.signalCount,
        avgOpenRate: parseFloat(c.avgOpenRate.toFixed(1)),
        avgClickRate: parseFloat(c.avgClickRate.toFixed(1)),
        recommendedWeight: parseFloat(recommendedWeight.toFixed(3)),
        recommendation:
          i < 2
            ? "Increase weight - high engagement correlation"
            : i >= categoryStats.length - 2
              ? "Decrease weight - lower engagement correlation"
              : "Maintain current weight",
      };
    });

    // Top performing signals
    const topSignals = signalStats
      .sort((a, b) => {
        const scoreA = a.avgOpenRate * 0.4 + a.avgClickRate * 0.6;
        const scoreB = b.avgOpenRate * 0.4 + b.avgClickRate * 0.6;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map((s) => ({
        signalId: s.signalId,
        appearances: s.appearances,
        avgOpenRate: parseFloat(s.avgOpenRate.toFixed(1)),
        avgClickRate: parseFloat(s.avgClickRate.toFixed(1)),
      }));

    return {
      success: true,
      analyzedNewsletters: newsletters.length,
      analyzedSignals: signalStats.length,
      weightRecommendations,
      topPerformingSignals: topSignals,
      summary: {
        bestCategory: categoryStats[0]?.category || null,
        worstCategory: categoryStats[categoryStats.length - 1]?.category || null,
        recommendation: `Focus on ${categoryStats[0]?.category || "top"} category signals for higher engagement`,
      },
    };
  },
});
