import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, Panel } from "@/components/DashboardShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SCALEUP — AI growth console for your business" },
      {
        name: "description",
        content:
          "SCALEUP is an AI workspace for growing businesses: an AI assistant, a priority-ranked task planner and a smart email generator in one console.",
      },
      { property: "og:title", content: "SCALEUP — AI growth console" },
      {
        property: "og:description",
        content:
          "AI assistant, task planner and smart email generator for growing businesses.",
      },
    ],
  }),
  component: Overview,
});

const STATS = [
  { label: "Pipeline", value: "$184.2k", note: "+12.4% wk", accent: true },
  { label: "Tasks done", value: "23 / 31", note: "74% close", accent: false },
  { label: "Emails drafted", value: "9", note: "3 awaiting send", accent: false },
  { label: "AI spend", value: "62%", note: "of monthly quota", accent: false },
];

const PLAN = [
  { p: "P0", task: "Send Meridian follow-up proposal", meta: "09:00 · Sales", tag: "CLOSE" },
  { p: "P1", task: "Review Colby & Co contract redlines", meta: "11:30 · Legal", tag: "REVIEW" },
  { p: "P2", task: "Prep Northwind discovery call notes", meta: "15:00 · Sales", tag: "PREP" },
];

function Overview() {
  const today = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  });

  return (
    <DashboardShell breadcrumb="Overview" title="Growth command">
      <section className="rise mb-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-aurora">
              Today · {today}
            </p>
            <h2 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-4xl">
              Your growth, one decision at a time.
            </h2>
          </div>
          <Link
            to="/assistant"
            className="rounded-lg bg-aurora px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-aurora/40 transition-colors hover:bg-aurora/90"
          >
            New session
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl bg-frost p-4 ring-1 ring-line backdrop-blur-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                {s.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold tracking-tight">
                {s.value}
              </p>
              <p
                className={`mt-1 font-mono text-xs ${s.accent ? "text-aurora" : "text-mist"}`}
              >
                {s.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rise grid gap-4 lg:grid-cols-2">
        <Panel
          label="Assistant"
          sub="chat transcript"
          num="02"
          footer={
            <Link
              to="/assistant"
              className="flex items-center gap-2 rounded-lg bg-ink-soft/70 px-3 py-2.5 ring-1 ring-line"
            >
              <span className="flex-1 text-sm text-mist">Ask SCALEUP anything…</span>
              <span className="grid size-7 place-items-center rounded-md bg-aurora text-xs font-bold text-ink">
                →
              </span>
            </Link>
          }
        >
          <div className="space-y-3 px-4 py-4">
            <div className="flex gap-2.5">
              <div className="grid size-7 shrink-0 place-items-center rounded-md bg-ink-soft font-mono text-[9px] text-mist ring-1 ring-line">
                YOU
              </div>
              <div className="max-w-[80%] rounded-lg rounded-tl-none bg-ink-soft/60 px-3 py-2 text-sm leading-relaxed ring-1 ring-line">
                Prioritise my 4 open deals for this week.
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="grid size-7 shrink-0 place-items-center rounded-md bg-aurora/15 ring-1 ring-aurora/30">
                <div className="size-2 rounded-full bg-aurora" />
              </div>
              <div className="max-w-[85%] rounded-lg rounded-tl-none bg-frost/80 px-3 py-2.5 text-sm leading-relaxed ring-1 ring-line">
                Ranked by close probability:{" "}
                <span className="font-semibold">Meridian Retail</span> (87% — proposal
                overdue), <span className="font-semibold">Colby &amp; Co</span> (72%),{" "}
                <span className="text-foreground/80">Northwind</span> (54%). I flagged
                Meridian as your top priority — want me to draft the follow-up?
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          label="Email Studio"
          sub="generated draft"
          num="04"
          footer={
            <div className="flex items-center gap-2">
              <Link
                to="/email"
                className="rounded-lg bg-aurora px-3.5 py-2 text-sm font-semibold text-ink"
              >
                Open studio
              </Link>
              <span className="ml-auto font-mono text-[10px] text-aurora/80">
                AI-drafted
              </span>
            </div>
          }
        >
          <div className="border-b border-line px-4 py-3">
            <div className="rounded-lg bg-ink-soft/70 px-3 py-2 text-sm leading-snug text-foreground/80 ring-1 ring-line">
              Follow up with Meridian on the overdue proposal, gentle nudge.
            </div>
            <div className="mt-2.5 flex gap-1.5">
              <span className="rounded-md bg-aurora/15 px-2.5 py-1 text-xs font-medium text-aurora ring-1 ring-aurora/30">
                Persuasive
              </span>
              <span className="rounded-md px-2.5 py-1 text-xs font-medium text-mist ring-1 ring-line">
                Formal
              </span>
              <span className="rounded-md px-2.5 py-1 text-xs font-medium text-mist ring-1 ring-line">
                Friendly
              </span>
            </div>
          </div>
          <div className="flex-1 px-4 py-4">
            <div className="rounded-lg bg-ink-soft/40 p-3 ring-1 ring-line">
              <p className="mb-2 font-mono text-xs text-mist">
                Subject: <span className="text-foreground">Meridian — ready to move forward?</span>
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">
                Hi Dana, our proposal for the Q3 rollout has been with you for a week.
                The onboarding timeline still holds — if you confirm by Friday we lock
                the launch date and your team is live by the 1st.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="rise mt-4">
        <Panel label="Planner" sub="priority-ranked · day" num="03">
          <div className="space-y-2 px-4 py-4">
            {PLAN.map((row) => (
              <div
                key={row.task}
                className="flex items-center gap-3 rounded-lg bg-ink-soft/50 px-3 py-2.5 ring-1 ring-line"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md text-xs font-bold ${
                    row.p === "P2"
                      ? "bg-mist/15 text-mist"
                      : "bg-aurora/20 text-aurora"
                  }`}
                >
                  {row.p}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.task}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-mist">{row.meta}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-mist">
                  {row.tag}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </DashboardShell>
  );
}
