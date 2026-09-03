import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUp } from "lucide-react";
import { DashboardShell, Panel } from "@/components/DashboardShell";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — SCALEUP" },
      {
        name: "description",
        content:
          "Chat with the SCALEUP AI workplace assistant for growth strategy, sales, marketing and operations advice.",
      },
      { property: "og:title", content: "AI Assistant — SCALEUP" },
      {
        property: "og:description",
        content: "An interactive AI workplace assistant for growing businesses.",
      },
    ],
  }),
  component: Assistant,
});

const SUGGESTIONS = [
  "Prioritise my 4 open deals for this week.",
  "How do I reduce churn on a $49/mo plan?",
  "Draft a 30-day plan to double inbound leads.",
];

function Assistant() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <DashboardShell breadcrumb="Assistant" title="Workplace assistant">
      <Panel
        label="Assistant"
        sub="chat transcript"
        num="02"
        className="rise min-h-[70vh]"
        footer={
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 rounded-lg bg-ink-soft/70 px-3 py-2 ring-1 ring-line"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SCALEUP anything…"
              className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-mist"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="grid size-7 place-items-center rounded-md bg-aurora text-ink transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </form>
        }
      >
        <div className="flex-1 space-y-4 px-4 py-4">
          {messages.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-display text-lg font-semibold tracking-tight">
                What are we scaling today?
              </p>
              <p className="mt-1 text-sm text-mist">
                Ask about pipeline, pricing, hiring or growth experiments.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-lg bg-ink-soft/60 px-3 py-2 text-xs text-foreground/85 ring-1 ring-line transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex gap-2.5">
                  <div className="grid size-7 shrink-0 place-items-center rounded-md bg-ink-soft font-mono text-[9px] text-mist ring-1 ring-line">
                    YOU
                  </div>
                  <div className="max-w-[80%] rounded-lg rounded-tl-none bg-ink-soft/60 px-3 py-2 text-sm leading-relaxed ring-1 ring-line">
                    {text}
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className="flex gap-2.5">
                <div className="grid size-7 shrink-0 place-items-center rounded-md bg-aurora/15 ring-1 ring-aurora/30">
                  <div className="size-2 rounded-full bg-aurora" />
                </div>
                <div className="prose-scaleup max-w-[85%] space-y-2 text-sm leading-relaxed text-foreground/90 [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-foreground">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <p className="pl-10 font-mono text-xs text-mist">Thinking…</p>
          )}
          {error && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive ring-1 ring-destructive/30">
              The assistant couldn't respond. Please try again in a moment.
            </p>
          )}
        </div>
      </Panel>
    </DashboardShell>
  );
}
