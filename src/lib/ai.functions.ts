import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import {
  SCALEUP_MODEL,
  createLovableAiGatewayProvider,
  requireGatewayKey,
} from "./ai-gateway.server";

const PlanInput = z.object({
  tasks: z.string().min(1),
  horizon: z.enum(["day", "week"]),
  hours: z.number().min(1).max(16),
});

const EmailInput = z.object({
  brief: z.string().min(1),
  tone: z.enum(["formal", "friendly", "professional", "persuasive"]),
  recipient: z.string().optional(),
});

async function run(system: string, prompt: string) {
  const gateway = createLovableAiGatewayProvider(requireGatewayKey());
  const result = streamText({
    model: gateway(SCALEUP_MODEL),
    system,
    prompt,
  });
  return await result.text;
}

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      `You are SCALEUP's task planner for busy business operators.
Return a markdown schedule only — no preamble.
Rank every task P0 (revenue/deadline critical), P1 (important) or P2 (useful).
For a day plan use time blocks starting 09:00. For a week plan group by weekday.
Each line: time block, task, priority tag, and a 6-word reason.
End with a short "Cut or defer" list of anything that does not fit the available hours.`,
      `Horizon: ${data.horizon}. Available focused hours per day: ${data.hours}.
Tasks and context:\n${data.tasks}`,
    );
    return { text };
  });

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      `You write professional business emails.
Return exactly: a line starting with "Subject: " then a blank line, then the email body.
No commentary, no markdown headings, no placeholders other than [Name] when truly unknown.
Keep it under 160 words unless the brief demands more.
Tone rules — formal: precise, respectful, no contractions. friendly: warm, human, light contractions.
professional: clear, competent, neutral business register.
persuasive: lead with value, create momentum, end with a clear specific ask.`,
      `Tone: ${data.tone}.${data.recipient ? ` Recipient: ${data.recipient}.` : ""}
Brief: ${data.brief}`,
    );
    return { text };
  });

const InsightsInput = z.object({
  context: z.string().min(1),
});

export const generateInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InsightsInput.parse(input))
  .handler(async ({ data }) => {
    const text = await run(
      `You are SCALEUP's business growth analyst for small businesses.
Return markdown only, no preamble. Produce exactly three sections:
"## Productivity" (2 observations), "## Growth opportunities" (3 concrete plays),
"## Watch outs" (2 risks). Every bullet is one sentence, specific and actionable,
and where possible names the next step the operator should take this week.`,
      `Business context, goals and open tasks:\n${data.context}`,
    );
    return { text };
  });
