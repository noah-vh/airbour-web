/**
 * OpenRouter Client Wrapper
 * Centralized wrapper for OpenRouter API calls with:
 * - Granular admin controls per operation type
 * - Error handling and retries
 * - Usage tracking and logging
 */

/**
 * Configuration for OpenRouter API call
 */
export interface OpenRouterCallConfig {
  operationType: "classification" | "extraction" | "analysis" | "chat" | "generation";
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  model?: string;
}

/**
 * Result from OpenRouter API call
 */
export interface OpenRouterCallResult {
  response: string;
  modelUsed: string;
  tokensUsed: number;
  cost: number;
  timestamp: number;
}

/**
 * Call OpenRouter API with admin controls and error handling
 */
export async function callOpenRouter(
  config: OpenRouterCallConfig
): Promise<OpenRouterCallResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  // Mock admin controls - always enabled for standalone frontend
  console.log(`Checking admin controls for ${config.operationType} (mock: enabled)`);

  // Default models by operation type
  const defaultModels = {
    classification: "anthropic/claude-3.5-haiku",
    extraction: "anthropic/claude-3.5-haiku",
    analysis: "anthropic/claude-3.5-sonnet",
    chat: "anthropic/claude-3.5-sonnet",
    generation: "anthropic/claude-3.5-sonnet"
  };

  const model = config.model || defaultModels[config.operationType];
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenRouter API call attempt ${attempt + 1}/${maxRetries + 1} for ${config.operationType} using ${model}`);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Airbour Innovation Platform"
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(config.systemPrompt ? [{ role: "system", content: config.systemPrompt }] : []),
            { role: "user", content: config.prompt }
          ],
          temperature: config.temperature || 0.7,
          max_tokens: config.maxTokens || 2000,
          ...(config.responseMimeType && { response_format: { type: "json_object" } })
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenRouter API");
      }

      const result: OpenRouterCallResult = {
        response: data.choices[0].message.content,
        modelUsed: model,
        tokensUsed: data.usage?.total_tokens || 0,
        cost: data.usage?.total_tokens ? (data.usage.total_tokens / 1000) * 0.01 : 0,
        timestamp: Date.now()
      };

      console.log(`OpenRouter API call successful for ${config.operationType}:`, {
        model: result.modelUsed,
        tokensUsed: result.tokensUsed,
        cost: result.cost
      });

      // Mock analytics logging
      console.log(`Logging LLM usage (mock):`, {
        operationType: config.operationType,
        model: result.modelUsed,
        tokensUsed: result.tokensUsed,
        cost: result.cost
      });

      return result;

    } catch (error) {
      lastError = error as Error;
      console.error(`OpenRouter API call attempt ${attempt + 1} failed for ${config.operationType}:`, lastError.message);

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new Error(`OpenRouter API call failed after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
}

/**
 * Helper function for backwards compatibility with Gemini-style calls
 */
export async function callOpenRouterCompat(
  useCase: string,
  prompt: string,
  systemPrompt?: string,
  temperature?: number
): Promise<{ response: string; modelUsed: string }> {
  const openRouterConfig: OpenRouterCallConfig = {
    operationType: useCase as any,
    prompt,
    systemPrompt,
    temperature
  };

  const result = await callOpenRouter(openRouterConfig);

  return {
    response: result.response,
    modelUsed: result.modelUsed
  };
}