import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Target, Trash2 } from "lucide-react";
import { DashboardShell, Panel } from "@/components/DashboardShell";
import {
  SEED_GOALS,
  SEED_TASKS,
  uid,
  useLocalState,
  type Goal,
  type Task,
} from "@/lib/store";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Business Goals — SCALEUP" },
      {
        name: "description",
        content:
          "Set business goals with deadlines, track progress and connect the tasks that move each goal forward.",
      },
      { property: "og:title", content: "Business Goals — SCALEUP" },
      {
        property: "og:description",
        content: "Goals, deadlines, progress tracking and connected tasks.",
      },
    ],
  }),
  component: Goals,
});

export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-ink-soft"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-aurora transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function Goals() {
  const [goals, setGoals] = useLocalState<Goal[]>("scaleup.goals", SEED_GOALS);
  const [tasks, setTasks] = useLocalState<Task[]>("scaleup.tasks", SEED_TASKS);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [deadline, setDeadline] = useState("");

  const add = () => {
    if (!title.trim()) return;
    setGoals((prev) => [
      { id: uid(), title: title.trim(), metric: metric.trim(), deadline, progress: 0 },
      ...prev,
    ]);
    setTitle("");
    setMetric("");
    setDeadline("");
  };

  return (
    <DashboardShell breadcrumb="Goals" title="Business goals">
      <div className="rise grid gap-4 lg:grid-cols-[380px_1fr]">
        <Panel
          label="New goal"
          sub="what winning looks like"
          num="05"
          footer={
            <button
              onClick={add}
              disabled={!title.trim()}
              className="w-full rounded-lg bg-aurora px-4 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-40"
            >
              Add goal
            </button>
          }
        >
          <div className="space-y-4 px-4 py-4">
            <div>
              <label
                htmlFor="goal-title"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist"
              >
                Goal
              </label>
              <input
                id="goal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Reach $250k quarterly pipeline"
                className="mt-2 w-full rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm outline-none ring-1 ring-line placeholder:text-mist focus:ring-aurora/50"
              />
            </div>
            <div>
              <label
                htmlFor="goal-metric"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist"
              >
                Success metric
              </label>
              <input
                id="goal-metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                placeholder="$250k signed pipeline"
                className="mt-2 w-full rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm outline-none ring-1 ring-line placeholder:text-mist focus:ring-aurora/50"
              />
            </div>
            <div>
              <label
                htmlFor="goal-deadline"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist"
              >
                Deadline
              </label>
              <input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-2 w-full rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm outline-none ring-1 ring-line focus:ring-aurora/50"
              />
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          {goals.length === 0 && (
            <Panel label="Goals" sub="nothing tracked yet" num="05">
              <div className="px-4 py-10 text-center">
                <Target className="mx-auto size-6 text-mist" />
                <p className="mt-3 text-sm text-mist">
                  No goals yet. Add your first one to start tracking progress.
                </p>
              </div>
            </Panel>
          )}
          {goals.map((g) => {
            const linked = tasks.filter((t) => t.goalId === g.id);
            return (
              <Panel
                key={g.id}
                label={g.title}
                sub={g.deadline ? `due ${g.deadline}` : "no deadline"}
                num={`${g.progress}%`}
              >
                <div className="space-y-3 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] text-mist">
                      {g.metric || "No metric set"}
                    </p>
                    <button
                      onClick={() => setGoals((prev) => prev.filter((x) => x.id !== g.id))}
                      aria-label={`Delete goal ${g.title}`}
                      className="text-mist transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <ProgressBar value={g.progress} />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={g.progress}
                    aria-label={`Progress for ${g.title}`}
                    onChange={(e) =>
                      setGoals((prev) =>
                        prev.map((x) =>
                          x.id === g.id ? { ...x, progress: Number(e.target.value) } : x,
                        ),
                      )
                    }
                    className="w-full accent-[var(--aurora)]"
                  />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                      Connected tasks
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {linked.length === 0 && (
                        <p className="text-xs text-mist">
                          No tasks linked yet — link one below.
                        </p>
                      )}
                      {linked.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 rounded-lg bg-ink-soft/50 px-3 py-2 text-sm ring-1 ring-line"
                        >
                          <span className="font-mono text-[10px] text-aurora">
                            {t.priority}
                          </span>
                          <span className={t.done ? "line-through text-mist" : ""}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                      <select
                        aria-label={`Link a task to ${g.title}`}
                        value=""
                        onChange={(e) =>
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === e.target.value ? { ...t, goalId: g.id } : t,
                            ),
                          )
                        }
                        className="mt-1 w-full rounded-lg bg-ink-soft/70 px-3 py-2 text-xs text-mist outline-none ring-1 ring-line focus:ring-aurora/50"
                      >
                        <option value="">Link an existing task…</option>
                        {tasks
                          .filter((t) => t.goalId !== g.id)
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
