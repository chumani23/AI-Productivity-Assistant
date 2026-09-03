import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const SCALEUP_MODEL = "google/gemini-3.7-flash";

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export function requireGatewayKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}
