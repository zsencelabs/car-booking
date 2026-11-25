"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarClock, MapPin, Repeat, Zap, type LucideIcon } from "lucide-react";
import { draftToParams } from "@/lib/booking";
import { cn } from "@/lib/utils";
import type { TripType } from "@/types";
import { EASE, MaskLines } from "./reveal";

const CYCLE_MS = 3200;

const OPTIONS: { value: TripType; label: string; text: string; icon: LucideIcon; chip: string; cta: string }[] = [
  { value: "immediate", label: "Ride now", text: "A verified driver heads your way in minutes.", icon: Zap, chip: "~4 min away", cta: "Book a ride now" },
  { value: "scheduled", label: "Schedule", text: "Lock in a pickup date and time ahead.", icon: CalendarClock, chip: "Fri · 6:30 PM", cta: "Schedule a ride" },
  { value: "one-way", label: "One-way", text: "Point A to point B, with an upfront estimate.", icon: ArrowRight, chip: "Upfront estimate", cta: "Book one-way" },
  { value: "round-trip", label: "Round-trip", text: "Out and back with the same booking.", icon: Repeat, chip: "2 legs · same booking", cta: "Book a round-trip" },
];

const ROUTE = "M34 92 C 110 92, 118 34, 196 34 S 292 70, 326 40";

export function ReadyToBook() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = !!useReducedMotion();
  const [sel, setSel] = useState(0);
  const [touched, setTouched] = useState(false);
  const opt = OPTIONS[sel];

  // Auto-cycle to show it's alive — stops for good once the user engages.
  useEffect(() => {
    if (!inView || reduce || touched) return;
    const t = setTimeout(() => setSel((s) => (s + 1) % OPTIONS.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [sel, inView, reduce, touched]);

  const pick = (i: number) => { setTouched(true); setSel(i); };

  return (
    <section className="dark relative isolate overflow-hidden bg-background py-24 text-foreground md:py-32">
      {/* backdrop: drifting route lines, a glow that follows the selection, grain */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="none" className="absolute inset-0 size-full opacity-50" fill="none">
          {[
            "M-40 470 C 220 470, 300 230, 560 260 S 900 470, 1240 330",
            "M-40 140 C 260 90, 420 260, 700 200 S 1020 70, 1240 130",
          ].map((d, i) => (
            <motion.path
              key={d} d={d} strokeWidth={1.5} strokeDasharray="5 11"
              className={i ? "stroke-white/15" : "stroke-primary/35"}
              initial={{ strokeDashoffset: 0 }}
              animate={reduce ? undefined : { strokeDashoffset: i ? 160 : -160 }}
              transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </svg>
        <motion.div
          className="absolute size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]"
          initial={false}
          animate={{ left: "68%", top: `${35 + sel * 10}%` }}
          transition={{ duration: 1.2, ease: EASE }}
        />
        <div className="grain absolute inset-0 opacity-[0.06]" />
      </div>

      <div ref={ref} className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">07 — Ready to book</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Ready when", <span key="b" className="text-primary">you are.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Pick how you want to ride and we&apos;ll take you straight to booking. No charge until your ride is complete.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
          {/* ── options ── */}
          <div
            role="group"
            aria-label="Ways to book"
            className="min-w-0 divide-y border-y"
            onMouseEnter={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const n = (sel + (e.key === "ArrowDown" ? 1 : OPTIONS.length - 1)) % OPTIONS.length;
              pick(n);
              (e.currentTarget.querySelectorAll("button")[n] as HTMLButtonElement | undefined)?.focus();
            }}
          >
            {OPTIONS.map((o, i) => {
              const on = i === sel;
              return (
                <motion.button
                  key={o.value}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                  className="group relative flex w-full items-center gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:py-6"
                >
                  {on && (
                    <motion.span layoutId="rtb-bar" className="absolute -left-4 inset-y-3 w-[3px] rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                  )}
                  {on && !touched && !reduce && (
                    <span aria-hidden className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                      <motion.span
                        key={`${sel}-${inView}`}
                        className="block h-full bg-primary/70"
                        initial={{ width: "0%" }}
                        animate={{ width: inView ? "100%" : "0%" }}
                        transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                      />
                    </span>
                  )}
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full border transition-all duration-300",
                      on ? "border-primary bg-primary text-primary-foreground shadow-[0_0_30px_-4px_var(--primary)]" : "border-white/10 text-muted-foreground group-hover:border-white/25 group-hover:text-foreground",
                    )}
                  >
                    <o.icon className="size-5" />
                  </span>
                  <motion.span className="min-w-0 flex-1" animate={{ x: on ? 6 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
                    <span className={cn("block text-xl font-semibold tracking-tight transition-colors md:text-2xl", !on && "text-muted-foreground group-hover:text-foreground")}>
                      {o.label}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{o.text}</span>
                  </motion.span>
                  <ArrowRight className={cn("size-5 shrink-0 transition-all duration-300", on ? "translate-x-0 text-primary opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60")} />
                </motion.button>
              );
            })}
          </div>

          {/* ── live ticket ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative min-w-0"
          >
            <div aria-hidden className="absolute inset-x-10 -bottom-6 h-24 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="h-8 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={opt.value}
                      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-semibold tracking-tight"
                    >
                      {opt.label}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={opt.chip}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary"
                  >
                    {opt.chip}
                  </motion.span>
                </AnimatePresence>
              </div>

              <RouteArt key={opt.value} type={opt.value} reduce={reduce} />

              <QuickBook type={opt.value} cta={opt.cta} />

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="flex gap-5">
                  <Link href="/categories" className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                    Browse vehicles <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href="/how-it-works" className="group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                    How booking works <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <span className="text-xs text-muted-foreground">No charge until your ride is complete.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── ticket parts ───────────── */

function RouteArt({ type, reduce }: { type: TripType; reduce: boolean }) {
  const round = type === "round-trip";
  return (
    <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
      <svg viewBox="0 0 360 120" className="h-auto w-full" fill="none" aria-hidden>
        {/* faint street grid */}
        {[30, 60, 90].map((y) => <line key={`h${y}`} x1="0" x2="360" y1={y} y2={y} className="stroke-white/[0.05]" />)}
        {[60, 120, 180, 240, 300].map((x) => <line key={`v${x}`} x1={x} x2={x} y1="0" y2="120" className="stroke-white/[0.05]" />)}

        <path d={ROUTE} className="stroke-white/10" strokeWidth={6} strokeLinecap="round" />
        <motion.path
          d={ROUTE} className="stroke-primary" strokeWidth={3} strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, ease: EASE }}
        />
        {round && (
          <motion.path
            d="M326 52 C 292 84, 196 50, 196 50 S 110 106, 34 104"
            className="stroke-primary/60" strokeWidth={2} strokeDasharray="4 6" strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: reduce ? 0 : 0.9, ease: EASE }}
          />
        )}

        {/* pickup + drop-off */}
        <circle cx="34" cy="92" r="7" className="fill-background stroke-foreground" strokeWidth={2.5} />
        <rect x="319" y="33" width="14" height="14" rx="2" className="fill-foreground" />

        {/* car */}
        {!reduce && (
          <g>
            <circle r="9" className="fill-primary/25" />
            <circle r="5" className="fill-primary" />
            <animateMotion dur="1.6s" begin="0.3s" fill="freeze" path={ROUTE} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
          </g>
        )}
      </svg>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>Pickup</span>
        <AnimatePresence initial={false}>
          {type === "scheduled" && (
            <motion.span
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.6 }}
              className="inline-flex items-center gap-1 text-primary"
            >
              <CalendarClock className="size-3" /> Pickup locked in
            </motion.span>
          )}
          {round && (
            <motion.span
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 1.4 }}
              className="inline-flex items-center gap-1 text-primary"
            >
              <Repeat className="size-3" /> Return leg included
            </motion.span>
          )}
        </AnimatePresence>
        <span>Drop-off</span>
      </div>
    </div>
  );
}

function QuickBook({ type, cta }: { type: TripType; cta: string }) {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const p = pickup.trim();
        router.push(`/book?${draftToParams({ tripType: type, ...(p ? { pickup: p } : {}) }).toString()}`);
      }}
      className="mt-5 flex flex-col gap-2 rounded-2xl border border-white/10 bg-background/60 p-1.5 focus-within:ring-2 focus-within:ring-ring/50 sm:flex-row sm:items-center sm:rounded-full sm:pl-5"
    >
      <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 sm:px-0">
        <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Pickup location</span>
        <input
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Enter pickup location"
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground sm:rounded-full"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={cta}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {cta}
          </motion.span>
        </AnimatePresence>
        <ArrowRight className="size-4" />
      </motion.button>
    </form>
  );
}
