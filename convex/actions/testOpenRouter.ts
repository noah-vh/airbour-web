"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const testOpenRouter = action({
  args: {},
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    console.log("API Key exists:", !!apiKey);
    console.log("API Key first 10 chars:", apiKey?.substring(0, 10));

    try {
      console.log("About to call fetch...");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://airbour.app",
          "X-Title": "Airbour Test"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-haiku",
          messages: [
            { role: "user", content: "Say 'test successful' in JSON format" }
          ],
          max_tokens: 50,
          response_format: { type: "json_object" }
        })
      });

      console.log("Fetch completed, status:", response.status);

      const text = await response.text();
      console.log("Response body:", text.substring(0, 500));

      return { success: true, status: response.status, body: text.substring(0, 1000) };

    } catch (error: any) {
      console.error("Error caught:", error);
      console.error("Error message:", error.message);
      console.error("Error cause:", error.cause);
      console.error("Error stack:", error.stack);

      return {
        success: false,
        error: error.message,
        cause: error.cause?.toString() || "no cause",
        stack: error.stack
      };
    }
  },
});
