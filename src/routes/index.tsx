import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Mail, MessageSquare, Target } from "lucide-react";
import { DashboardShell, Panel } from "@/components/DashboardShell";
import { ProgressBar } from "@/routes/goals";
import {
  SEED_GOALS,
  SEED_TASKS,
  useLocalState,
  type Goal,
  type Task,
} from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SCALEUP — Work Smarter. Grow Faster." },
      {
        name: "description",
        content:
          "SCALEUP is an AI business growth assistant for small businesses: dashboard, AI assistant, task planner, email generator, goals and insights in one workspace.",
      },
      { property: "og:title", content: "SCALEUP — Work Smarter. Grow Faster." },
      {
        property: "og:description",
        content:
          "AI assistant, task planner, email generator, goals and insights for growing businesses.",
      },
    ],
  }),
  component: Overview,
});

const STATS = [
  { label: "Pipeline", value: "$184.2k", note: "+12.4% wk", accent: true },
  { label: "Emails drafted", value: "9", note: "3 awaiting send", accent: false },
];

const QUICK = [
  { to: "/assistant", label: "Ask the assistant", icon: MessageSquare },
  { to: "/planner", label: "Plan my day", icon: CalendarClock },
  { to: "/email", label: "Write an email", icon: Mail },
  { to: "/goals", label: "Add a goal", icon: Target },
] as const;

function Overview() {
  const [tasks] = useLocalState<Task[]>("scaleup.tasks", SEED_TASKS);
  const [goals] = useLocalState<Goal[]>("scaleup.goals", SEED_GOALS);

  const today = new Date().toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  });
  const done = tasks.filter((t) => t.done).length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const todays = tasks.filter((t) => !t.done).slice(0, 4);

  return (
    <DashboardShell breadcrumb="Overview" title="Business overview">
      <section className="rise mb-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-aurora">
              Today · {today}
            </p>
            <h2 className="text-balance font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-4xl">
              Work smarter. Grow faster.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
              Your AI-powered growth assistant — priorities, drafts and
              recommendations, ready before you are.
            </p>
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
          <div className="rounded-xl bg-frost p-4 ring-1 ring-line backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
              Tasks done
            </p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">
              {done} / {tasks.length}
            </p>
            <div className="mt-2">
              <ProgressBar value={completion} />
            </div>
          </div>
          <div className="rounded-xl bg-frost p-4 ring-1 ring-line backdrop-blur-xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
              Goals on track
            </p>
            <p className="mt-1 font-display text-2xl font-bold tracking-tight">
              {goals.filter((g) => g.progress >= 50).length} / {goals.length}
            </p>
            <p className="mt-1 font-mono text-xs text-mist">this quarter</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="flex items-center gap-2.5 rounded-xl bg-frost px-3.5 py-3 text-sm font-medium ring-1 ring-line backdrop-blur-xl transition-colors hover:bg-ink-soft/70"
            >
              <q.icon className="size-4 text-aurora" />
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="rise grid gap-4 lg:grid-cols-2">
        <Panel
          label="Today's tasks"
          sub="priority-ranked"
          num="03"
          footer={
            <Link
              to="/planner"
              className="flex items-center justify-between rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm ring-1 ring-line"
            >
              <span className="text-mist">Open the planner</span>
              <span className="grid size-7 place-items-center rounded-md bg-aurora text-xs font-bold text-ink">
                →
              </span>
            </Link>
          }
        >
          <div className="space-y-2 px-4 py-4">
            {todays.length === 0 && (
              <p className="py-6 text-center text-sm text-mist">
                Nothing open — add tasks in the planner.
              </p>
            )}
            {todays.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-3 rounded-lg bg-ink-soft/50 px-3 py-2.5 ring-1 ring-line"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-md text-xs font-bold ${
                    row.priority === "P2"
                      ? "bg-mist/15 text-mist"
                      : "bg-aurora/20 text-aurora"
                  }`}
                >
                  {row.priority}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-mist">
                    {row.deadline ? `due ${row.deadline}` : "no deadline"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          label="Goal progress"
          sub="this quarter"
          num="05"
          footer={
            <Link
              to="/goals"
              className="flex items-center justify-between rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm ring-1 ring-line"
            >
              <span className="text-mist">Manage goals</span>
              <span className="grid size-7 place-items-center rounded-md bg-aurora text-xs font-bold text-ink">
                →
              </span>
            </Link>
          }
        >
          <div className="space-y-4 px-4 py-4">
            {goals.length === 0 && (
              <p className="py-6 text-center text-sm text-mist">
                No goals yet — set your first target.
              </p>
            )}
            {goals.map((g) => (
              <div key={g.id}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <span className="font-mono text-[11px] text-aurora">
                    {g.progress}%
                  </span>
                </div>
                <ProgressBar value={g.progress} />
                <p className="mt-1.5 font-mono text-[11px] text-mist">
                  {g.metric} {g.deadline && `· due ${g.deadline}`}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="rise mt-4">
        <Panel
          label="AI recommendations"
          sub="generated for your week"
          num="06"
          footer={
            <Link
              to="/insights"
              className="flex items-center justify-between rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm ring-1 ring-line"
            >
              <span className="text-mist">See full insights</span>
              <span className="grid size-7 place-items-center rounded-md bg-aurora text-xs font-bold text-ink">
                →
              </span>
            </Link>
          }
        >
          <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
            {[
              {
                t: "Close the overdue proposal",
                d: "Meridian has sat a week — a same-day nudge is your highest-value action.",
              },
              {
                t: "Protect two deep-work blocks",
                d: "Your P0 work keeps landing after 16:00; move it to the morning.",
              },
              {
                t: "Systemise follow-ups",
                d: "Three deals stalled at the same stage — template the follow-up email.",
              },
            ].map((r) => (
              <div
                key={r.t}
                className="rounded-lg bg-ink-soft/50 p-3 ring-1 ring-line"
              >
                <p className="text-sm font-semibold">{r.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{r.d}</p>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </DashboardShell>
  );
}
