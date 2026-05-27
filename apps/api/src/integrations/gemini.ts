import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "../config/env.js";

const geminiTripPlanSchema = z.object({
  location: z.string().optional(),
  note: z.string().optional(),
  suggestions: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        duration: z.string().min(1),
      })
    )
    .min(1)
    .max(5),
});

let client: GoogleGenAI | null = null;

function getClient() {
  if (!env.geminiApiKey) {
    throw Object.assign(new Error("AI_UNAVAILABLE"), { statusCode: 503 });
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  return client;
}

function extractJsonPayload(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw Object.assign(new Error("AI_UNAVAILABLE"), { statusCode: 503 });
}

function normalizeProviderError(error: unknown): never {
  if (error instanceof Error) {
    if (error.message === "AI_UNAVAILABLE" || error.message === "AI_RATE_LIMITED") {
      throw error;
    }

    const status =
      typeof error === "object" &&
      error &&
      "status" in error &&
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    if (status === 429 || /rate.?limit|429/i.test(error.message)) {
      throw Object.assign(new Error("AI_RATE_LIMITED"), { statusCode: 429 });
    }
  }

  throw Object.assign(new Error("AI_UNAVAILABLE"), { statusCode: 503 });
}

export async function generateTripPlanContent(prompt: string) {
  try {
    const response = await getClient().models.generateContent({
      model: env.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const payload = JSON.parse(extractJsonPayload(response.text || ""));
    return geminiTripPlanSchema.parse(payload);
  } catch (error) {
    normalizeProviderError(error);
  }
}
