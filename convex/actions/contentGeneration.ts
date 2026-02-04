"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Helper to build signal context
async function buildSignalContext(ctx: any, signalIds: Id<"signals">[]): Promise<string> {
  const signals = await Promise.all(
    signalIds.map((id: any) => ctx.runQuery(api.signals.getSignal, { id }))
  );

  return signals.map((signal: any) => `
Signal: ${signal.name}
Lifecycle: ${signal.lifecycle}
Description: ${signal.description}
Confidence: ${Math.round((signal.confidence || 0.5) * 100)}%
Keywords: ${signal.keywords?.join(', ') || 'N/A'}
  `).join('\n---\n');
}

// Helper to build mention context
async function buildMentionContext(ctx: any, mentionIds: Id<"raw_mentions">[]): Promise<string> {
  if (mentionIds.length === 0) return '';

  const mentions = await Promise.all(
    mentionIds.map((id: any) => ctx.runQuery(api.mentions.getMentionById, { id }))
  );

  return mentions.map((m: any) => `
Author: ${m?.author || 'Unknown'}
Content: "${m?.content || 'N/A'}"
  `).join('\n---\n');
}

// Stage 1: Generate multiple content ideas
export const generateContentIdeas: ReturnType<typeof action> = action({
  args: {
    signalIds: v.array(v.id("signals")),
    mentionIds: v.array(v.id("raw_mentions")),
    contentFormats: v.array(v.string()),
    numberOfIdeas: v.number(),
    voiceContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const signalsContext = await buildSignalContext(ctx, args.signalIds);
    const mentionsContext = await buildMentionContext(ctx, args.mentionIds);

    const voiceInstructions = args.voiceContext
      ? `\nVOICE/PERSPECTIVE:\n${args.voiceContext}\n`
      : '';

    const prompt = `You are a content strategist for innovation and technology content.
${voiceInstructions}

Available source materials:

INNOVATION SIGNALS:
${signalsContext}

TRENDING MENTIONS:
${mentionsContext || 'No mentions available'}

Generate ${args.numberOfIdeas} unique content ideas for these formats: ${args.contentFormats.join(', ')}

For each idea, provide a JSON object with:
{
  "format": "Article|Thread|Post|Video|Short Video",
  "hook": "Compelling opening line (20-30 words)",
  "angle": "Unique perspective (1 sentence)",
  "description": "What the content covers (2-3 sentences)",
  "targetAudience": "Primary audience",
  "keyMessages": ["message 1", "message 2", "message 3"]
}

Requirements:
- Each idea must be unique and non-overlapping
- Match tone to format
- Focus on actionable insights
- Connect signals to business value

IMPORTANT: Return a JSON object with this EXACT structure:
{
  "ideas": [
    { "format": "...", "hook": "...", "angle": "...", "description": "...", "targetAudience": "...", "keyMessages": [...] },
    ...
  ]
}`;

    // Call OpenRouter API directly
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured in Convex environment");
    }

    let response;
    let data;

    try {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://airbour.app",
          "X-Title": "Airbour Innovation Platform"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: "You are an expert content strategist. Always return valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        })
      });
    } catch (fetchError: any) {
      console.error("Fetch error details:", fetchError);
      throw new Error(`Network error calling OpenRouter: ${fetchError.message}. Cause: ${fetchError.cause || 'unknown'}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`Invalid OpenRouter response: ${JSON.stringify(data)}`);
    }

    console.log("Raw AI response:", data.choices[0].message.content);

    const parsedResponse = JSON.parse(data.choices[0].message.content);
    console.log("Parsed response type:", typeof parsedResponse);
    console.log("Is array?", Array.isArray(parsedResponse));

    // Handle both array and object responses (AI may return { "ideas": [...] } or [...])
    const ideas = Array.isArray(parsedResponse)
      ? parsedResponse
      : (parsedResponse.ideas || parsedResponse.content_ideas || Object.values(parsedResponse)[0] || []);

    console.log("Extracted ideas count:", ideas?.length);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error(`No ideas generated. Response was: ${JSON.stringify(parsedResponse).substring(0, 500)}`);
    }

    // Store ideas in database and return full objects
    const savedIdeas = [];
    for (const idea of ideas) {
      // Only fields that exist in the database schema
      const dbData = {
        format: idea.format || "Article",
        hook: idea.hook || "No hook provided",
        angle: idea.angle || "No angle provided",
        description: idea.description || "No description provided",
        sourceSignalIds: args.signalIds,
        sourceMentionIds: args.mentionIds,
        relevanceScore: 0.8,
        generatedBy: "anthropic/claude-3.5-sonnet",
      };

      const savedId = await ctx.runMutation(api.contentIdeas.create, dbData);

      // Return full object with _id AND extra AI-generated fields for frontend display
      savedIdeas.push({
        _id: savedId,
        ...dbData,
        // Include extra fields for frontend (not stored in DB)
        targetAudience: idea.targetAudience || "General audience",
        keyMessages: idea.keyMessages || [],
        status: "generated",
        createdAt: Date.now(),
      });
    }

    console.log("Saved", savedIdeas.length, "ideas to database");
    return { ideas: savedIdeas, tokensUsed: data.usage?.total_tokens || 0 };
  },
});

// Stage 2: Generate detailed outline
export const generateContentOutline: ReturnType<typeof action> = action({
  args: {
    contentIdeaId: v.id("content_ideas"),
    platform: v.string(),
    customInstructions: v.optional(v.string()),
    voiceContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.runQuery(api.contentIdeas.get, { id: args.contentIdeaId });

    if (!idea) {
      throw new Error("Content idea not found");
    }

    const platformConfig = await ctx.runQuery(api.platformFormats.getByPlatform, {
      platform: args.platform,
    });

    const signalsContext = await buildSignalContext(ctx, idea.sourceSignalIds);

    const voiceInstructions = args.voiceContext
      ? `\nVOICE/PERSPECTIVE:\n${args.voiceContext}\n`
      : '';

    const prompt = `Create a detailed content outline for this idea:
${voiceInstructions}

Hook: "${idea.hook}"
Angle: "${idea.angle}"
Description: ${idea.description}
Format: ${idea.format}
Platform: ${args.platform}

Platform constraints:
${JSON.stringify(platformConfig?.constraints, null, 2)}

Source signals:
${signalsContext}

${args.customInstructions || ''}

Create a structured outline with:
1. Opening (hook, context)
2. 3-5 main sections with:
   - Section title
   - Key points (3-5 bullets each)
   - Examples/data to include
   - Estimated length
   ${idea.format.toLowerCase().includes('video') ? '- Timestamp marker' : ''}
3. Conclusion (summary, CTA)

Return as JSON:
{
  "sections": [
    {
      "title": "Section title",
      "keyPoints": ["point 1", "point 2", ...],
      "estimatedLength": 150,
      "timestamp": "0:00-0:30"
    }
  ],
  "structure": "Full outline as text"
}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
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
          { role: "system", content: "You are a content strategist. Return valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const outline = JSON.parse(data.choices[0].message.content);

    // Map format to valid contentType
    const formatToContentType: Record<string, string> = {
      "article": "article",
      "thread": "thread",
      "post": "post",
      "video": "video_script",
      "short video": "short_video_script",
      "short_video": "short_video_script",
    };
    const contentType = formatToContentType[idea.format.toLowerCase()] || "article";

    // Create content draft with outline
    const draftId = await ctx.runMutation(api.contentDrafts.create, {
      title: idea.hook.substring(0, 100),
      contentType: contentType as any,
      platform: args.platform as any,
      stage: "outline",
      overview: {
        hook: idea.hook,
        angle: idea.angle,
        description: idea.description,
        targetAudience: "Innovation leaders",
        keyMessages: [],
        generatedAt: Date.now(),
      },
      outline: {
        sections: outline.sections,
        structure: outline.structure,
        generatedAt: Date.now(),
      },
      sourceSignalIds: idea.sourceSignalIds,
      sourceMentionIds: idea.sourceMentionIds,
      aiModel: "anthropic/claude-3.5-sonnet",
      totalTokensUsed: data.usage?.total_tokens || 0,
      generationCost: 0,
      createdBy: "system",
    });

    // Update idea with draft ID
    await ctx.runMutation(api.contentIdeas.update, {
      id: args.contentIdeaId,
      status: "in_progress",
      draftId,
      selectedAt: Date.now(),
    });

    return { draftId, outline };
  },
});

// Stage 3: Generate full content
export const generateFullContent: ReturnType<typeof action> = action({
  args: {
    draftId: v.id("content_drafts"),
    customInstructions: v.optional(v.string()),
    voiceContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.runQuery(api.contentDrafts.get, { id: args.draftId });

    if (!draft) {
      throw new Error("Draft not found");
    }

    const platformConfig = await ctx.runQuery(api.platformFormats.getByPlatform, {
      platform: draft.platform!,
    });

    const signalsContext = await buildSignalContext(ctx, draft.sourceSignalIds);

    // Build platform-specific prompt
    const isVideo = draft.contentType.includes('video');
    const isShortForm = ['tiktok', 'youtube_shorts', 'ig_reels'].includes(draft.platform!);

    const voiceInstructions = args.voiceContext
      ? `\nVOICE/PERSPECTIVE:\n${args.voiceContext}\n`
      : '';

    let prompt = `Write complete ${draft.contentType} content for ${draft.platform}.
${voiceInstructions}

Content Plan:
${JSON.stringify(draft.outline, null, 2)}

Platform Constraints:
${JSON.stringify(platformConfig?.constraints, null, 2)}

Style Guidelines:
${JSON.stringify(platformConfig?.styleGuidelines, null, 2)}

Source Materials:
${signalsContext}

${args.customInstructions || ''}

Requirements:
1. Follow the outline structure
2. Use engaging, ${platformConfig?.styleGuidelines.tone || 'professional'} tone
3. ${platformConfig?.constraints.maxCharacters ? `Stay under ${platformConfig.constraints.maxCharacters} characters` : ''}
${isVideo ? `4. Write as a VIDEO SCRIPT with:
   - Hook (first 3 seconds)
   - Visual descriptions in [brackets]
   - Timing markers
   - B-roll suggestions
   - Caption text
   ${isShortForm ? '5. Keep under 60 seconds for short-form' : ''}` : ''}
${draft.platform === 'twitter' ? '5. Structure as numbered thread with transitions' : ''}
${draft.platform === 'linkedin' ? '6. Use line breaks for readability, end with 3-5 hashtags' : ''}
${draft.platform === 'instagram' ? '7. Write caption + 3-5 carousel slide texts' : ''}

Format: ${platformConfig?.constraints.supportsMarkdown ? 'Use markdown (**bold**, _italic_, ## headings)' : 'Plain text'}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
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
          { role: "system", content: `You are a ${isVideo ? 'video script' : 'content'} writer specializing in ${draft.platform}.` },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse video-specific elements if applicable
    let videoElements = undefined;
    if (isVideo) {
      videoElements = {
        hooks: extractVideoHooks(content),
        bRoll: extractBRollSuggestions(content),
        captions: extractCaptions(content),
        transitions: extractTransitions(content),
      };
    }

    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // 200 wpm
    const estimatedDuration = isVideo ? calculateVideoDuration(content) : undefined;

    // Update draft
    await ctx.runMutation(api.contentDrafts.update, {
      id: args.draftId,
      stage: "content",
      content: {
        fullText: content,
        formattedText: content,
        wordCount,
        characterCount: charCount,
        estimatedReadTime,
        estimatedDuration,
        videoElements,
        generatedAt: Date.now(),
      },
      totalTokensUsed: draft.totalTokensUsed + (data.usage?.total_tokens || 0),
    });

    return { content, metrics: { wordCount, charCount, estimatedReadTime, estimatedDuration } };
  },
});

// Helper functions for video content
function extractVideoHooks(script: string): string[] {
  const hookMatches = script.match(/Hook:\s*(.+?)(?:\n|$)/gi) || [];
  return hookMatches.map((h: any) => h.replace(/Hook:\s*/i, '').trim());
}

function extractBRollSuggestions(script: string): string[] {
  const bRollMatches = script.match(/\[([^\]]+)\]/g) || [];
  return bRollMatches.map((b: any) => b.replace(/[\[\]]/g, ''));
}

function extractCaptions(script: string): string[] {
  const lines = script.split('\n').filter((l: any) => l.trim() && !l.includes('['));
  return lines;
}

function extractTransitions(script: string): string[] {
  const transitionMatches = script.match(/\b(cut to|transition to|next scene|meanwhile)\b/gi) || [];
  return transitionMatches;
}

function calculateVideoDuration(script: string): number {
  const words = script.split(/\s+/).length;
  return Math.ceil(words / 2.5); // ~150 words per minute for video = 2.5 words/sec
}

// AI Enhancement: Refine existing content
export const enhanceContent: ReturnType<typeof action> = action({
  args: {
    draftId: v.id("content_drafts"),
    enhancementType: v.union(
      v.literal("improve_clarity"),
      v.literal("add_data"),
      v.literal("strengthen_cta"),
      v.literal("adjust_tone"),
      v.literal("platform_optimize"),
      v.literal("add_hooks")
    ),
    customInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.runQuery(api.contentDrafts.get, { id: args.draftId });

    if (!draft) {
      throw new Error("Draft not found");
    }

    const currentContent = draft.content?.fullText || draft.outline?.structure || '';

    const enhancementPrompts: Record<string, string> = {
      improve_clarity: "Improve clarity and readability. Simplify complex sentences, add transitions, ensure logical flow.",
      add_data: "Add specific data points, statistics, and examples to strengthen arguments.",
      strengthen_cta: "Strengthen the call-to-action. Make it more compelling and actionable.",
      adjust_tone: "Adjust tone to be more engaging while staying professional.",
      platform_optimize: `Optimize for ${draft.platform} - adjust length, formatting, hashtags.`,
      add_hooks: "Add attention-grabbing hooks for video format. First 3 seconds must be compelling.",
    };

    const prompt = `Enhance this content:

${currentContent}

Enhancement requested: ${args.enhancementType}
Instructions: ${enhancementPrompts[args.enhancementType]}
${args.customInstructions || ''}

Return the enhanced version, maintaining the overall structure and message.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
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
          { role: "system", content: "You are a content editor." },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Create new version
    if (draft.content) {
      await ctx.runMutation(api.contentDrafts.update, {
        id: args.draftId,
        content: {
          ...draft.content,
          fullText: data.choices[0].message.content,
          generatedAt: Date.now(),
        },
      });
    }

    return { enhancedContent: data.choices[0].message.content };
  },
});
