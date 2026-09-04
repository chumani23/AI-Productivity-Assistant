import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell, Panel } from "@/components/DashboardShell";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — SCALEUP" },
      {
        name: "description",
        content:
          "Generate professional business emails in a formal, friendly, professional or persuasive tone with the SCALEUP email studio.",
      },
      { property: "og:title", content: "Smart Email Generator — SCALEUP" },
      {
        property: "og:description",
        content: "Professional AI-written emails in the tone your moment needs.",
      },
    ],
  }),
  component: EmailStudio,
});

type Tone = "formal" | "friendly" | "professional" | "persuasive";

function EmailStudio() {
  const [brief, setBrief] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("persuasive");
  const [copied, setCopied] = useState(false);
  const run = useServerFn(generateEmail);

  const draft = useMutation({
    mutationFn: () => run({ data: { brief, tone, recipient: recipient || undefined } }),
  });

  const text = draft.data?.text ?? "";
  const [subjectLine, ...bodyLines] = text.split("\n");
  const subject = subjectLine?.replace(/^Subject:\s*/i, "") ?? "";
  const body = bodyLines.join("\n").trim();

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <DashboardShell breadcrumb="Email Studio" title="Smart email generator">
      <div className="rise grid gap-4 lg:grid-cols-2">
        <Panel
          label="Brief"
          sub="what to say · to whom"
          num="04"
          footer={
            <button
              onClick={() => draft.mutate()}
              disabled={!brief.trim() || draft.isPending}
              className="w-full rounded-lg bg-aurora px-4 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
            >
              {draft.isPending ? "Writing…" : "Generate email"}
            </button>
          }
        >
          <div className="space-y-4 px-4 py-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                Recipient (optional)
              </label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Dana Okoye, Head of Ops at Meridian"
                className="mt-2 w-full rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm outline-none ring-1 ring-line placeholder:text-mist focus:ring-aurora/50"
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                What should this email do?
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={6}
                placeholder="Follow up on the overdue Q3 proposal, gentle nudge, ask them to confirm by Friday."
                className="mt-2 w-full resize-none rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm leading-relaxed outline-none ring-1 ring-line placeholder:text-mist focus:ring-aurora/50"
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                Tone
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["formal", "friendly", "professional", "persuasive"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ring-1 transition-colors ${
                      tone === t
                        ? "bg-aurora/15 text-aurora ring-aurora/30"
                        : "text-mist ring-line hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          label="Email Studio"
          sub="generated draft"
          num="04"
          className="min-h-80"
          footer={
            <div className="flex items-center gap-2">
              <button
                onClick={copy}
                disabled={!text}
                className="rounded-lg bg-aurora px-3.5 py-2 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => draft.mutate()}
                disabled={!brief.trim() || draft.isPending}
                className="rounded-lg px-3.5 py-2 text-sm font-medium ring-1 ring-line transition-colors hover:bg-frost disabled:opacity-40"
              >
                Regenerate
              </button>
              <span className="ml-auto font-mono text-[10px] text-aurora/80">
                AI-drafted
              </span>
            </div>
          }
        >
          <div className="flex-1 px-4 py-4">
            {draft.isPending && (
              <p className="font-mono text-xs text-mist">Drafting in a {tone} tone…</p>
            )}
            {draft.isError && (
              <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive ring-1 ring-destructive/30">
                Couldn't generate the email. Please try again.
              </p>
            )}
            {!draft.isPending && !text && !draft.isError && (
              <p className="text-sm text-mist">
                Describe the outcome you want and pick a tone — your draft appears here.
              </p>
            )}
            {text && (
              <div className="rounded-lg bg-ink-soft/40 p-3 ring-1 ring-line">
                <p className="mb-2 font-mono text-xs text-mist">
                  Subject: <span className="text-foreground">{subject}</span>
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {body}
                </p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
