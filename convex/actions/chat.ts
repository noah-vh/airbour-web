"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

export const chatMessage = action({
  args: {
    message: v.string(),
    conversationId: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Mock chat message action
    const responses = [
      "That's an interesting perspective on innovation trends.",
      "Based on the current signals, I see potential for growth in that area.",
      "Let me help you analyze that market opportunity.",
      "The data suggests strong momentum in emerging technologies.",
      "That aligns with what we're seeing in our innovation mapping.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: randomResponse,
      conversationId: args.conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        messageId: `msg_${Date.now()}`,
        tokens: Math.floor(Math.random() * 100) + 50,
        model: "mock-ai-model",
      },
    };
  },
});