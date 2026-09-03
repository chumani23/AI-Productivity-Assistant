import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  SCALEUP_MODEL,
  createLovableAiGatewayProvider,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are SCALEUP, an AI workplace assistant for business owners and operators.
You help with growth strategy, sales pipeline, marketing, operations, hiring and productivity.
Be concrete, concise and action-oriented. Prefer short paragraphs and tight bullet lists.
Ask a clarifying question only when the answer would materially change your advice.
Never invent numbers about the user's business — ask for them.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(SCALEUP_MODEL),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
