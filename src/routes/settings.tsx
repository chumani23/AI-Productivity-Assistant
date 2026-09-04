import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { DashboardShell, Panel } from "@/components/DashboardShell";
import { DEFAULT_SETTINGS, useLocalState, type Settings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SCALEUP" },
      {
        name: "description",
        content:
          "Manage your SCALEUP profile, working preferences, notifications and AI defaults.",
      },
      { property: "og:title", content: "Settings — SCALEUP" },
      {
        property: "og:description",
        content: "Profile, preferences, notifications and AI settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist"
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg bg-ink-soft/70 px-3 py-2.5 text-sm outline-none ring-1 ring-line placeholder:text-mist focus:ring-aurora/50"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-lg bg-ink-soft/50 px-3 py-2.5 text-left ring-1 ring-line transition-colors hover:bg-ink-soft/70"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block font-mono text-[11px] text-mist">{hint}</span>
      </span>
      <span
        className={`grid h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
          checked ? "bg-aurora" : "bg-mist/30"
        }`}
      >
        <span
          className={`size-4 rounded-full bg-ink transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useLocalState<Settings>(
    "scaleup.settings",
    DEFAULT_SETTINGS,
  );
  const [saved, setSaved] = useState(false);

  const patch = (p: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...p }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <DashboardShell breadcrumb="Settings" title="Workspace settings">
      <div className="rise grid gap-4 lg:grid-cols-2">
        <Panel
          label="Profile"
          sub="who SCALEUP works for"
          num="07"
          footer={
            <p className="flex items-center gap-2 font-mono text-[11px] text-mist">
              {saved ? (
                <>
                  <Check className="size-3.5 text-aurora" />
                  <span className="text-aurora">Saved</span>
                </>
              ) : (
                "Changes save automatically"
              )}
            </p>
          }
        >
          <div className="space-y-4 px-4 py-4">
            <Field
              id="s-name"
              label="Your name"
              value={settings.name}
              onChange={(v) => patch({ name: v })}
            />
            <Field
              id="s-business"
              label="Business"
              value={settings.business}
              onChange={(v) => patch({ business: v })}
            />
            <Field
              id="s-role"
              label="Role"
              value={settings.role}
              onChange={(v) => patch({ role: v })}
            />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel label="Notifications" sub="how we reach you" num="07">
            <div className="space-y-2 px-4 py-4">
              <Toggle
                label="Email notifications"
                hint="Task deadlines and goal milestones"
                checked={settings.emailNotifications}
                onChange={(v) => patch({ emailNotifications: v })}
              />
              <Toggle
                label="Weekly digest"
                hint="Monday summary of progress and priorities"
                checked={settings.weeklyDigest}
                onChange={(v) => patch({ weeklyDigest: v })}
              />
            </div>
          </Panel>

          <Panel label="AI settings" sub="defaults for generation" num="07">
            <div className="space-y-4 px-4 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                  Default email tone
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(["formal", "friendly", "professional", "persuasive"] as const).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => patch({ tone: t })}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ring-1 transition-colors ${
                          settings.tone === t
                            ? "bg-aurora/15 text-aurora ring-aurora/30"
                            : "text-mist ring-line hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="s-hours"
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist"
                >
                  Default focus hours / day · {settings.focusHours}
                </label>
                <input
                  id="s-hours"
                  type="range"
                  min={1}
                  max={12}
                  value={settings.focusHours}
                  onChange={(e) => patch({ focusHours: Number(e.target.value) })}
                  className="mt-3 w-full accent-[var(--aurora)]"
                />
              </div>
              <p className="rounded-lg bg-ink-soft/50 px-3 py-2.5 text-xs leading-relaxed text-mist ring-1 ring-line">
                AI runs on a secured server-side connection — your prompts never expose
                API credentials to the browser.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
