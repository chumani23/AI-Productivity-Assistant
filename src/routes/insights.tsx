import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Lightbulb } from "lucide-react";
import { DashboardShell, Panel } from "@/components/DashboardShell";
import { generateInsights } from "@/lib/ai.functions";
import { ProgressBar } from "@/routes/goals";
import {
  SEED_GOALS,
  SEED_TASKS,
  formatTasksForAI,
  useLocalState,
  type Goal,
  type Task,
} from "@/lib/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — SCALEUP" },
      {
        name: "description",
        content:
          "AI-generated productivity and business growth recommendations based on your goals and open tasks.",
      },
      { property: "og:title", content: "Insights — SCALEUP" },
      {
        property: "og:description",
        content: "Productivity and growth recommendations, generated from your workspace.",
      },
    ],
  }),
  component: Insights,
});

function Insights() {
  const [tasks] = useLocalState<Task[]>("scaleup.tasks", SEED_TASKS);
  const [goals] = useLocalState<Goal[]>("scaleup.goals", SEED_GOALS);
  const run = useServerFn(generateInsights);

  const context = [
    "Goals:",
    ...goals.map((g) => `- ${g.title} (${g.metric || "no metric"}) — ${g.progress}% done, due ${g.deadline || "no deadline"}`),
    "Open tasks:",
    formatTasksForAI(tasks) || "- none",
  ].join("\n");

  const insights = useMutation({
    mutationFn: () => run({ data: { context } }),
  });

  const done = tasks.filter((t) => t.done).length;
  const completion = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const avgGoal = goals.length
    ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
    : 0;

  return (
    <DashboardShell breadcrumb="Insights" title="Growth insights">
      <div className="rise grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel
          label="Signals"
          sub="from your workspace"
          num="06"
          footer={
            <button
              onClick={() => insights.mutate()}
              disabled={insights.isPending}
              className="w-full rounded-lg bg-aurora px-4 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
            >
              {insights.isPending ? "Analysing…" : "Generate insights"}
            </button>
          }
        >
          <div className="space-y-4 px-4 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                Task completion · {completion}%
              </p>
              <div className="mt-2">
                <ProgressBar value={completion} />
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                Average goal progress · {avgGoal}%
              </p>
              <div className="mt-2">
                <ProgressBar value={avgGoal} />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-mist">
              {goals.length} goals · {tasks.length - done} open tasks feed this analysis.
            </p>
          </div>
        </Panel>

        <Panel label="Recommendations" sub="AI-generated" num="06" className="min-h-80">
          <div className="flex-1 px-4 py-4">
            {insights.isPending && (
              <p className="font-mono text-xs text-mist">
                Reading your goals and tasks…
              </p>
            )}
            {insights.isError && (
              <p className="rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive ring-1 ring-destructive/30">
                Couldn't generate insights. Please try again.
              </p>
            )}
            {!insights.isPending && !insights.data && !insights.isError && (
              <div className="py-10 text-center">
                <Lightbulb className="mx-auto size-6 text-mist" />
                <p className="mt-3 text-sm text-mist">
                  Generate a read on where your week is leaking time and where growth
                  is available.
                </p>
              </div>
            )}
            {insights.data && (
              <div className="space-y-2 rounded-lg bg-ink-soft/40 p-3 text-sm leading-relaxed text-foreground/90 ring-1 ring-line [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-foreground">
                <ReactMarkdown>{insights.data.text}</ReactMarkdown>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
