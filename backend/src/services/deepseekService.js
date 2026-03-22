import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

const DEFAULT_TIMEOUT_MS = 20000;

const parseErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || "DeepSeek request failed";
  } catch (_error) {
    return "DeepSeek request failed";
  }
};

export const deepseekService = {
  isConfigured() {
    return Boolean(env.DEEPSEEK_API_KEY);
  },

  async createChatCompletion({
    messages,
    temperature = 0.35,
    maxTokens = 900
  }) {
    if (!this.isConfigured()) {
      throw new ApiError(503, "DeepSeek is not configured");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(`${env.DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: env.DEEPSEEK_MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new ApiError(response.status, await parseErrorMessage(response));
      }

      const data = await response.json();
      return {
        content: data?.choices?.[0]?.message?.content || "",
        usage: data?.usage || null,
        model: data?.model || env.DEEPSEEK_MODEL
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError(504, "DeepSeek request timed out");
      }

      throw error instanceof ApiError
        ? error
        : new ApiError(502, "DeepSeek request could not be completed");
    } finally {
      clearTimeout(timeout);
    }
  }
};
