"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Helper to build signal context
async function buildSignalContext(ctx: any, signalIds: Id<"signals">[]) {
  const signals = await Promise.all(
    signalIds.map((id: any) => ctx.runQuery(api.signals.getSignal, { id }))
  );

  return signals.map((signal: any) => `
Signal: ${signal.name}
Lifecycle: ${signal.lifecycle}
Description: ${signal.description}
Confidence: ${Math.round((signal.confidence || 0.5) * 100)}%
Keywords: ${signal.keywords?.join(', ') || 'N/A'}
STEEP: ${signal.steep?.join(', ') || 'N/A'}
Growth: ${signal.growth || 0}%
Sentiment: ${signal.sentiment || 0.5}
Mentions: ${signal.mentionCount || 0}
  `).join('\n---\n');
}

// Helper to build mention context
async function buildMentionContext(ctx: any, mentionIds: Id<"raw_mentions">[]) {
  if (mentionIds.length === 0) return '';

  const mentions = await Promise.all(
    mentionIds.map((id: any) => ctx.runQuery(api.mentions.getMentionById, { id }))
  );

  return mentions.map((m: any) => `
Author: ${m?.author || 'Unknown'}
Content: "${m?.content || 'N/A'}"
Platform: ${m?.source || 'Unknown'}
Sentiment: ${m?.sentiment || 'neutral'}
  `).join('\n---\n');
}

// Generate content for a single newsletter section
export const generateNewsletterSection: ReturnType<typeof action> = action({
  args: {
    sectionType: v.string(),
    signalIds: v.array(v.id("signals")),
    mentionIds: v.array(v.id("raw_mentions")),
    customContext: v.optional(v.string()),
    voiceContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const signalsContext = await buildSignalContext(ctx, args.signalIds);
    const mentionsContext = await buildMentionContext(ctx, args.mentionIds);

    // Build voice instructions
    const voiceInstructions = args.voiceContext
      ? `\n\nVOICE/PERSPECTIVE:\n${args.voiceContext}\n`
      : '';

    // Build section-specific prompt
    let prompt = '';
    let systemPrompt = `You are an expert innovation newsletter writer.${voiceInstructions}`;

    switch (args.sectionType) {
      case 'header':
        prompt = `Write a newsletter header that welcomes readers and previews these innovation signals:\n\n${signalsContext}\n\nMake it engaging, 150-200 words, with a forward-thinking tone.`;
        break;

      case 'signal_highlight':
        prompt = `Create a "Signal Spotlight" section analyzing these innovation signals:\n\n${signalsContext}\n\nFor each signal:\n1. Write a compelling headline\n2. Explain business implications\n3. Describe current stage and trajectory\n4. Suggest what to watch next\n\nUse markdown with ## headings, bullet points. 200-300 words per signal.`;
        break;

      case 'trending_mentions':
        prompt = `Create a "What's Trending" section from these mentions:\n\n${mentionsContext}\n\nGroup by theme, highlight insightful quotes, explain why they matter. Use bullet points. 150-250 words total.`;
        break;

      case 'data_insights':
        prompt = `Analyze these signals and create a "Data Insights" section:\n\n${signalsContext}\n\nPresent key statistics, growth patterns, adoption trends. Use clear numbers and percentages. 200-250 words.`;
        break;

      case 'expert_commentary':
        prompt = `Create an "Expert Commentary" section from these mentions:\n\n${mentionsContext}\n\nHighlight the most authoritative voices, synthesize their perspectives, identify consensus and debates. 250-300 words.`;
        break;

      case 'quick_takes':
        prompt = `Write "Quick Takes" on 3-5 micro-trends from:\n\n${signalsContext}\n\nEach take: 1-2 sentences, punchy, insightful. Total 150-200 words.`;
        break;

      case 'innovation_spotlight':
        prompt = `Write an "Innovation Spotlight" deep dive on the most significant signal:\n\n${signalsContext}\n\nCover: what it is, why it matters, who's leading, what's next. 400-500 words with ## headings.`;
        break;

      case 'resources':
        prompt = `Curate a "Resources" section based on these signals:\n\n${signalsContext}\n\nSuggest relevant: reports, tools, articles, communities. Brief description for each. Use bullet points.`;
        break;

      case 'footer':
        prompt = `Write a newsletter footer with: brief sign-off, reminder about unsubscribe/preferences, social links placeholder. Warm and professional. 50-75 words.`;
        break;

      case 'custom_content':
        prompt = `Create newsletter content for "${args.sectionType}" section using:\n\nSignals:\n${signalsContext}\n\nMentions:\n${mentionsContext}\n\n${args.customContext || ''}`;
        break;

      default:
        prompt = `Create newsletter content for "${args.sectionType}" section using:\n\nSignals:\n${signalsContext}\n\nMentions:\n${mentionsContext}\n\n${args.customContext || ''}`;
    }

    // Call OpenRouter API directly
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured in Convex environment");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Airbour Innovation Platform"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: "anthropic/claude-3.5-sonnet",
      tokensUsed: data.usage?.total_tokens || 0,
      sectionType: args.sectionType,
    };
  },
});

// Generate full newsletter
export const generateFullNewsletter: ReturnType<typeof action> = action({
  args: {
    newsletterId: v.id("newsletters"),
    regenerateSections: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Fetch newsletter
    const newsletter = await ctx.runQuery(api.newsletters.get, {
      id: args.newsletterId,
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Generate content for each section
    const sectionsToGenerate = args.regenerateSections
      ? newsletter.sections.filter((s: any) => args.regenerateSections!.includes(s.id))
      : newsletter.sections.filter((s: any) => !s.content || !s.aiGenerated);

    const generatedSections = await Promise.all(
      sectionsToGenerate.map((section: any) =>
        ctx.runAction(api.actions.newsletterGeneration.generateNewsletterSection, {
          sectionType: section.type,
          signalIds: section.signalIds || [],
          mentionIds: section.mentionIds || [],
        })
      )
    );

    // Update newsletter with generated content
    const updatedSections = newsletter.sections.map((section: any) => {
      const generated = generatedSections.find(g => g.sectionType === section.type);
      if (generated) {
        return {
          ...section,
          content: generated.content,
          aiGenerated: true,
          generatedAt: Date.now(),
        };
      }
      return section;
    });

    await ctx.runMutation(api.newsletters.update, {
      id: args.newsletterId,
      sections: updatedSections,
    });

    return { success: true, sectionsGenerated: generatedSections.length };
  },
});
