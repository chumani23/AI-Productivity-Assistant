import { useCallback, useEffect, useState } from "react";

export type Priority = "P0" | "P1" | "P2";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  deadline: string;
  goalId?: string;
  done: boolean;
};

export type Goal = {
  id: string;
  title: string;
  metric: string;
  deadline: string;
  progress: number;
};

export type Settings = {
  name: string;
  business: string;
  role: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  tone: "formal" | "friendly" | "professional" | "persuasive";
  focusHours: number;
};

export const DEFAULT_SETTINGS: Settings = {
  name: "Chumani",
  business: "Scaleup Ventures",
  role: "Founder",
  emailNotifications: true,
  weeklyDigest: true,
  tone: "professional",
  focusHours: 6,
};

export const SEED_TASKS: Task[] = [
  {
    id: "t1",
    title: "Send Meridian follow-up proposal",
    priority: "P0",
    deadline: "",
    done: false,
  },
  {
    id: "t2",
    title: "Review Colby & Co contract redlines",
    priority: "P1",
    deadline: "",
    done: false,
  },
  {
    id: "t3",
    title: "Prep Northwind discovery call notes",
    priority: "P2",
    deadline: "",
    done: true,
  },
];

export const SEED_GOALS: Goal[] = [
  {
    id: "g1",
    title: "Reach $250k quarterly pipeline",
    metric: "$184.2k of $250k",
    deadline: "2026-09-30",
    progress: 74,
  },
  {
    id: "g2",
    title: "Launch referral programme",
    metric: "3 of 6 milestones",
    deadline: "2026-10-15",
    progress: 50,
  },
];

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage unavailable */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function formatTasksForAI(tasks: Task[]) {
  return tasks
    .filter((t) => !t.done)
    .map(
      (t) =>
        `- ${t.title} [${t.priority}]${t.deadline ? ` due ${t.deadline}` : ""}`,
    )
    .join("\n");
}
