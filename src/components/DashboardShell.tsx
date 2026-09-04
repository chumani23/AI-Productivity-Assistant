import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import avatar from "@/assets/avatar.jpg";

const NAV = [
  { to: "/", label: "Overview", num: "01" },
  { to: "/assistant", label: "Assistant", num: "02" },
  { to: "/planner", label: "Planner", num: "03" },
  { to: "/email", label: "Email Studio", num: "04" },
  { to: "/goals", label: "Goals", num: "05" },
  { to: "/insights", label: "Insights", num: "06" },
  { to: "/settings", label: "Settings", num: "07" },
] as const;

function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "size-8" : "size-9";
  const dot = size === "sm" ? "size-2" : "size-2.5";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid ${box} place-items-center rounded-lg bg-aurora/15 ring-1 ring-aurora/30`}
      >
        <div className={`${dot} rounded-full bg-aurora pulse-dot`} />
      </div>
      <div>
        <p className="font-display font-bold leading-none tracking-tight">SCALEUP</p>
        {size === "md" && (
          <p className="mt-0.5 font-mono text-[10px] text-mist">Work smarter. Grow faster.</p>
        )}
      </div>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          className="group flex items-center justify-between rounded-lg px-2.5 py-2.5 text-sm font-medium text-mist transition-colors hover:text-foreground"
          activeProps={{
            className:
              "!text-foreground bg-frost ring-1 ring-line backdrop-blur-md",
          }}
        >
          <span className="flex items-center gap-3">
            <span className="size-1.5 rounded-full bg-mist group-data-[status=active]:bg-aurora" />
            {item.label}
          </span>
          <span className="font-mono text-[10px] text-mist">{item.num}</span>
        </Link>
      ))}
    </nav>
  );
}

function Autonomy() {
  return (
    <div className="rounded-lg bg-frost px-3 py-3 ring-1 ring-line backdrop-blur-md">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
        Autonomy
      </p>
      <p className="mt-1 text-xs leading-snug text-foreground/85">
        SCALEUP drafts, you decide. Every output is yours to review.
      </p>
    </div>
  );
}

export function DashboardShell({
  breadcrumb,
  title,
  children,
}: {
  breadcrumb: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink font-sans text-foreground antialiased">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.15_255/.22),transparent_60%)] blur-[10px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 size-[560px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.66_0.17_280/.18),transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 size-[520px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.78_0.11_225/.16),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-ink-soft/60 px-4 py-6 backdrop-blur-xl md:flex">
          <div className="mb-8 px-2">
            <Brand />
          </div>
          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
            Workspace
          </p>
          <NavList />
          <div className="mt-auto pt-6">
            <Autonomy />
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-ink-soft px-4 py-6">
              <div className="mb-8 flex items-center justify-between px-2">
                <Brand />
                <button onClick={() => setOpen(false)} aria-label="Close">
                  <X className="size-4 text-mist" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <div className="mt-auto pt-6">
                <Autonomy />
              </div>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-line bg-ink/70 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-4 px-5 md:px-8">
              <div className="flex items-center gap-3 md:hidden">
                <button onClick={() => setOpen(true)} aria-label="Open navigation">
                  <Menu className="size-5 text-mist" />
                </button>
                <Brand size="sm" />
              </div>
              <div className="hidden min-w-0 items-center gap-3 md:flex">
                <span className="font-mono text-[11px] text-mist">{breadcrumb}</span>
                <span className="text-mist/40">/</span>
                <h1 className="truncate font-display font-semibold tracking-tight">
                  {title}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full bg-frost px-3 py-1.5 ring-1 ring-line sm:flex">
                  <span className="size-1.5 rounded-full bg-aurora pulse-dot" />
                  <span className="font-mono text-xs text-mist">Live · {clock}</span>
                </div>
                <img
                  src={avatar}
                  alt="Your account"
                  loading="lazy"
                  width={512}
                  height={512}
                  className="size-9 rounded-full object-cover ring-1 ring-line"
                />
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-8 md:py-8">
            {children}
            <p className="rise mt-8 font-mono text-[11px] leading-relaxed text-mist/70">
              Responsible AI: SCALEUP uses AI to draft responses, schedules and
              emails. Outputs are generated, not verified — review for accuracy and
              tone before you act or send.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Panel({
  label,
  sub,
  num,
  children,
  footer,
  className = "",
}: {
  label: string;
  sub: string;
  num: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl bg-frost ring-1 ring-line backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-aurora/15 ring-1 ring-aurora/30">
            <div className="size-2 rounded-full bg-aurora" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-none">{label}</p>
            <p className="mt-0.5 font-mono text-[10px] text-mist">{sub}</p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-mist">{num}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer && <div className="border-t border-line p-3">{footer}</div>}
    </div>
  );
}
