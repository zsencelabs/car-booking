"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Building2, Car, ChevronLeft, ChevronRight, Pause, Play, Quote, Star, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";

type Role = "Rider" | "Driver" | "Fleet";
type Testimonial = { name: string; role: Role; detail: string; rating: number; text: string };

const SLIDE_MS = 4200;

const FILTERS: { value: Role | "All"; label: string }[] = [
  { value: "All", label: "All reviews" },
  { value: "Rider", label: "Riders" },
  { value: "Driver", label: "Drivers" },
  { value: "Fleet", label: "Fleets" },
];

const BADGE: Record<Role, { icon: LucideIcon; className: string }> = {
  Rider: { icon: User, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  Driver: { icon: Car, className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  Fleet: { icon: Building2, className: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
};

const initials = (name: string) =>
  name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const pad = (n: number) => String(n).padStart(2, "0");

export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = !!useReducedMotion();
  const [filter, setFilter] = useState<Role | "All">("All");
  const [start, setStart] = useState(0);
  const [direction, setDirection] = useState(1);
  // Paused by the button (stays paused), or while the pointer or focus is inside.
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);

  const shown = filter === "All" ? items : items.filter((t) => t.role === filter);
  const n = shown.length;
  const playing = inView && !reduce && !paused && !holding && n > 1;
  // Endless row: the current review first, then the ones after it, wrapping around.
  const row = Array.from({ length: n }, (_, k) => shown[(start + k) % n]);

  function step(by: number) {
    setDirection(by);
    setStart((s) => (s + by + n) % n);
  }

  function pick(value: Role | "All") {
    setFilter(value);
    setStart(0);
    setDirection(1);
  }

  // One timer per slide, only while playing. Moving by hand restarts it.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => { setDirection(1); setStart((s) => (s + 1) % n); }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [start, playing, n]);

  return (
    <section className="border-t bg-background py-24 md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-10 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">06 — Reviews</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["What riders, drivers", <span key="b" className="text-muted-foreground">and fleets say.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground lg:justify-self-end">
            Every side of the marketplace uses the same rules: verified drivers, upfront prices and pay that shows up where it should.
          </p>
        </div>

        <div
          ref={ref}
          onPointerEnter={() => setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHolding(false); }}
        >
          {/* filters + controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Filter reviews" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const count = f.value === "All" ? items.length : items.filter((t) => t.role === f.value).length;
                const on = filter === f.value;
                return (
                  <button
                    key={f.value} type="button" role="tab" aria-selected={on}
                    onClick={() => pick(f.value)}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on ? "border-foreground bg-foreground text-background" : "bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {f.label}
                    <span className={cn("font-mono text-xs", on ? "text-background/70" : "text-muted-foreground")}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2 font-mono text-xs tabular-nums text-muted-foreground" aria-live="polite">
                {pad(n ? start + 1 : 0)} / {pad(n)}
              </span>
              {!reduce && (
                <RoundButton label={paused ? "Play reviews" : "Pause reviews"} onClick={() => setPaused((p) => !p)}>
                  {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
                </RoundButton>
              )}
              <RoundButton label="Previous review" onClick={() => step(-1)} disabled={n <= 1}>
                <ChevronLeft aria-hidden className="size-4" />
              </RoundButton>
              <RoundButton label="Next review" onClick={() => step(1)} disabled={n <= 1} solid>
                <ChevronRight aria-hidden className="size-4" />
              </RoundButton>
            </div>
          </div>

          {/* cards: 1 on phones, 2 on tablets, 3 on desktop */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              {row.map((t, k) => (
                <motion.figure
                  key={`${filter}-${t.name}`}
                  layout={!reduce}
                  custom={direction}
                  initial={reduce ? false : { opacity: 0, x: 40 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -40 * direction }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
                    k >= 1 && "hidden md:flex",
                    k >= 2 && "md:hidden lg:flex",
                    k >= 3 && "lg:hidden",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <Stars rating={t.rating} />
                    <Quote aria-hidden className="size-5 text-muted-foreground/40" />
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed">{t.text}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(t.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{t.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{t.detail}</span>
                    </span>
                    <RoleBadge role={t.role} />
                  </figcaption>
                </motion.figure>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Sample reviews for the design preview. At launch, only riders, drivers and fleets with a completed ride can leave a review.
        </p>
      </div>
    </section>
  );
}

function RoundButton({ label, onClick, disabled, solid, children }: { label: string; onClick: () => void; disabled?: boolean; solid?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-label={label} onClick={onClick} disabled={disabled}
      className={cn(
        "grid size-10 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
        solid ? "border-foreground bg-foreground text-background hover:opacity-90" : "bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i} aria-hidden strokeWidth={1.75}
          className={cn("size-4", i < rating ? "fill-primary text-brand-ink" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const { icon: Icon, className } = BADGE[role];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      <Icon aria-hidden className="size-3.5" />
      {role}
    </span>
  );
}
