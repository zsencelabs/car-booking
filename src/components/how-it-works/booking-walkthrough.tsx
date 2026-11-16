"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { BadgeCheck, CalendarDays, Car, CarFront, Check, Clock, Loader2, Lock, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOW_IT_WORKS } from "@/lib/mock/content";
import { EASE, Reveal } from "@/components/landing/reveal";

const DURATIONS = [4200, 3800, 3800, 4000, 4000];

/** Runs `fn` after `ms` unless instant; resets when the screen remounts. */
function useAfter(ms: number, instant: boolean) {
  const [done, setDone] = useState(instant);
  useEffect(() => {
    if (instant) return;
    const t = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(t);
  }, [ms, instant]);
  return done || instant;
}

function useTypewriter(text: string, startMs: number, instant: boolean, speed = 45) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) return;
    let i: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      i = setInterval(() => setN((c) => (c >= text.length ? (clearInterval(i), c) : c + 1)), speed);
    }, startMs);
    return () => { clearTimeout(t); clearInterval(i); };
  }, [text, startMs, instant, speed]);
  return instant ? text : text.slice(0, n);
}

export function BookingWalkthrough() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState(0);

  // One timer per step; only while on screen. Reduced motion: manual only.
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % HOW_IT_WORKS.length), DURATIONS[step]);
    return () => clearTimeout(t);
  }, [step, inView, reduce]);

  return (
    <Reveal>
      <div ref={ref}>
        <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:gap-10">
          {/* ── step rail ── */}
          <div className="py-2 lg:self-center lg:py-8">
            <div className="flex items-center justify-between">
              <span className="eyebrow flex items-center gap-2 text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Booking a ride
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">0{step + 1} / 0{HOW_IT_WORKS.length}</span>
            </div>

            <div className="mt-4 h-8 overflow-hidden" role="status" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                  transition={{ duration: 0.3 }}
                  className="truncate text-xl font-semibold tracking-tight"
                >
                  {HOW_IT_WORKS[step].title}
                </motion.p>
              </AnimatePresence>
            </div>

            <ol className="mt-7">
              {HOW_IT_WORKS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                const Icon = s.icon;
                return (
                  <li key={s.title} className="relative pb-6 last:pb-0">
                    {i < HOW_IT_WORKS.length - 1 && (
                      <span aria-hidden className="absolute bottom-1 left-[15px] top-10 w-px overflow-hidden bg-border">
                        {done && <span className="block size-full bg-primary" />}
                        {active && !reduce && (
                          <motion.span
                            key={`${step}-${inView}`}
                            className="block w-full bg-primary"
                            initial={{ height: "0%" }}
                            animate={{ height: inView ? "100%" : "0%" }}
                            transition={{ duration: DURATIONS[i] / 1000, ease: "linear" }}
                          />
                        )}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={active ? "step" : undefined}
                      className="group flex w-full gap-3.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span
                        className={cn(
                          "relative grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                          done && "border-primary bg-primary text-primary-foreground",
                          active && "border-primary bg-primary/15 text-foreground",
                          !done && !active && "text-muted-foreground group-hover:border-foreground/30",
                        )}
                      >
                        {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                      </span>
                      <span className="min-w-0 pt-1">
                        <span className={cn("block text-sm font-medium leading-tight", !done && !active && "text-muted-foreground group-hover:text-foreground")}>
                          {s.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{s.text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ── browser window ── */}
          <div className="relative isolate grid place-items-center py-8 md:px-6 md:py-12">
            <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
            <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)] blur-2xl" />
            <div className="@container relative w-full max-w-[760px] overflow-hidden rounded-2xl border bg-background shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)]">
              {/* chrome */}
              <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                </div>
                <div className="mx-auto flex h-7 w-full max-w-[340px] items-center justify-center gap-1.5 overflow-hidden rounded-md border bg-background px-3">
                  <Lock className="size-3 shrink-0 text-muted-foreground" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={step}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="truncate font-mono text-[11px] text-muted-foreground"
                    >
                      dropoff.com<span className="text-foreground">{URLS[step]}</span>
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="w-[42px]" />
              </div>
              {/* site nav */}
              <div className="flex items-center gap-6 border-b px-5 py-3">
                <span className="text-sm font-semibold tracking-tight">dropoff<span className="text-brand-ink">.</span></span>
                <div className="hidden gap-4 text-[11px] text-muted-foreground @md:flex">
                  <span>Rides</span><span>Safety</span><span>Help</span>
                </div>
                <span className="ml-auto grid size-7 place-items-center rounded-full bg-muted text-[10px] font-semibold">AM</span>
              </div>
              {/* page */}
              <div className="h-[470px] overflow-hidden p-5 @lg:h-[330px] @lg:p-7">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="h-full"
                  >
                    {step === 0 && <WhereScreen instant={reduce} />}
                    {step === 1 && <PickScreen instant={reduce} />}
                    {step === 2 && <ConfirmScreen instant={reduce} />}
                    {step === 3 && <PayScreen instant={reduce} />}
                    {step === 4 && <RateScreen instant={reduce} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ───────────── screens (web layouts) ───────────── */

const URLS = ["/book", "/book/vehicles", "/book/confirmation", "/trips/DO-20481", "/trips/DO-20481/rate"];

function PageTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-5">
      <p className="text-lg font-semibold tracking-tight @lg:text-xl">{children}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function WhereScreen({ instant }: { instant: boolean }) {
  const pickup = useTypewriter("1 Ferry Building, SF", 300, instant);
  const drop = useTypewriter("Oracle Park, SF", 1400, instant);
  const when = useAfter(2300, instant);
  const ready = useAfter(2800, instant);
  return (
    <div className="flex h-full flex-col">
      <PageTitle sub="Book now or schedule ahead.">Where are you going?</PageTitle>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border @lg:flex @lg:h-[64px]">
        <Seg className="col-span-2 @lg:flex-[1.4]" label="Pickup" marker={<span className="size-2.5 rounded-full border-2 border-foreground" />}>
          <Typed value={pickup} placeholder="Pickup location" typing={!instant && pickup.length > 0 && drop.length === 0} />
        </Seg>
        <Seg className="col-span-2 @lg:flex-[1.4]" label="Drop-off" marker={<span className="size-2.5 bg-foreground" />}>
          <Typed value={drop} placeholder="Where to?" typing={!instant && drop.length > 0 && !when} />
        </Seg>
        <Seg className="@lg:flex-1" label="Date" marker={<CalendarDays className="size-3.5 text-muted-foreground" />}>
          <Fade show={when}>Today</Fade>
        </Seg>
        <Seg className="@lg:flex-1" label="Time" marker={<Clock className="size-3.5 text-muted-foreground" />}>
          <Fade show={when} delay={0.08}>6:30 PM</Fade>
        </Seg>
        <div className="col-span-2 grid place-items-center bg-background p-1.5 @lg:col-span-1">
          <motion.span
            animate={ready ? { opacity: 1, scale: [1, 1.05, 1] } : { opacity: 0.45, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex h-full min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            <Search className="size-4" /> Search
          </motion.span>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">No charge until your ride is complete.</p>
    </div>
  );
}

function Seg({ label, marker, className, children }: { label: string; marker: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 bg-background px-4 py-2.5", className)}>
      <span className="grid size-4 shrink-0 place-items-center">{marker}</span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="h-5 truncate text-sm">{children}</div>
      </div>
    </div>
  );
}

function Typed({ value, placeholder, typing }: { value: string; placeholder: string; typing: boolean }) {
  return (
    <>
      {value || <span className="text-muted-foreground">{placeholder}</span>}
      {typing && <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground" />}
    </>
  );
}

function Fade({ show, delay = 0, children }: { show: boolean; delay?: number; children: React.ReactNode }) {
  return (
    <motion.span initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 4 }} transition={{ duration: 0.3, delay, ease: EASE }} className="inline-block">
      {children}
    </motion.span>
  );
}

const RIDES = [
  { name: "Economy", seats: 4, eta: "4 min", price: "$28–32" },
  { name: "Comfort", seats: 4, eta: "6 min", price: "$33–37" },
  { name: "SUV", seats: 6, eta: "5 min", price: "$44–49" },
];

function PickScreen({ instant }: { instant: boolean }) {
  const picked = useAfter(1500, instant);
  const sel = picked ? 2 : 0;
  return (
    <div className="flex h-full flex-col">
      <PageTitle sub="Ferry Building → Oracle Park · Today 6:30 PM">Choose a vehicle</PageTitle>
      <div className="grid gap-2 @lg:grid-cols-3 @lg:gap-3">
        {RIDES.map((r, i) => (
          <motion.div
            key={r.name}
            initial={instant ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1, ease: EASE }}
            className="relative flex items-center gap-3 rounded-xl border p-3 @lg:flex-col @lg:items-start @lg:gap-2 @lg:p-4"
          >
            {sel === i && (
              <motion.span layoutId="ride-pick-web" className="absolute inset-0 rounded-xl border-2 border-primary bg-primary/10" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
            )}
            <span className="relative grid size-9 place-items-center rounded-lg bg-muted">
              {r.name === "SUV" ? <CarFront className="size-4" /> : <Car className="size-4" />}
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-medium">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.seats} seats · {r.eta} away</p>
            </div>
            <span className="relative font-mono text-sm @lg:mt-1 @lg:text-base @lg:font-semibold">{r.price}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{picked ? "SUV" : "Economy"}</span> · upfront estimate, charged after the trip
        </p>
        <motion.span animate={{ opacity: picked ? 1 : 0.45 }} className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Continue
        </motion.span>
      </div>
    </div>
  );
}

function ConfirmScreen({ instant }: { instant: boolean }) {
  const found = useAfter(1300, instant);
  return (
    <div className="flex h-full flex-col">
      <PageTitle sub="Booking DO-20481">{found ? "You're booked" : "Finding your driver…"}</PageTitle>
      <div className="grid gap-3 @lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border p-4">
          <AnimatePresence mode="wait" initial={false}>
            {!found ? (
              <motion.div key="search" exit={{ opacity: 0 }} className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="found"
                initial={instant ? false : { opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="flex items-center gap-3"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted font-semibold">JR</span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium">Jordan R. <BadgeCheck className="size-4 text-brand-ink" aria-label="Verified" /></p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3 fill-primary text-primary" /> 4.97 · Black Chevrolet Tahoe</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Info k="Pickup" v="Ferry Building" />
          <Info k="Drop-off" v="Oracle Park" />
          <Info k="Time" v="Today, 6:30 PM" />
          <Info k="Plate" v={found ? "8KZM214" : "—"} mono />
        </div>
      </div>
      <motion.span
        initial={false}
        animate={found ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.35, delay: instant ? 0 : 0.3, ease: EASE }}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary/15 py-3 text-sm font-medium text-brand-ink"
      >
        <Check className="size-4" strokeWidth={3} /> Confirmed · details sent to your email
      </motion.span>
    </div>
  );
}

function Info({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <p className="text-muted-foreground">{k}</p>
      <p className={cn("mt-0.5 truncate font-medium", mono && "font-mono")}>{v}</p>
    </div>
  );
}

function PayScreen({ instant }: { instant: boolean }) {
  const arrived = useAfter(2200, instant);
  return (
    <div className="flex h-full flex-col">
      <PageTitle sub="Booking DO-20481 · SUV">{arrived ? "Trip complete" : "On your way"}</PageTitle>
      <div className="grid gap-3 @lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border p-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Ferry Building</span><span>Oracle Park</span>
          </div>
          <div className="relative mt-4 h-1.5 rounded-full bg-muted">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              initial={{ width: instant ? "100%" : "0%" }} animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-background bg-foreground text-background shadow"
              initial={{ left: instant ? "100%" : "0%" }} animate={{ left: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <CarFront className="size-3" />
            </motion.span>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{arrived ? "Dropped off at 6:52 PM" : "Arriving around 6:52 PM · no charge yet"}</p>
        </div>
        <motion.div
          initial={false}
          animate={arrived ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="space-y-2 rounded-2xl border p-4 text-sm"
        >
          <p className="eyebrow mb-1 text-muted-foreground">Receipt</p>
          <div className="flex justify-between"><span className="text-muted-foreground">Fare</span><span className="font-mono">{arrived ? "$40.00" : "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Card</span><span className="font-mono">•••• 4242</span></div>
          <div className="flex justify-between border-t pt-2 font-medium"><span>Charged</span><span className="font-mono">{arrived ? "$40.00" : "$0.00"}</span></div>
        </motion.div>
      </div>
      <p className="mt-auto text-center text-[11px] text-muted-foreground">Your card is only charged once the trip is completed.</p>
    </div>
  );
}

const TIPS = ["None", "15%", "20%", "25%"];

function RateScreen({ instant }: { instant: boolean }) {
  const tipped = useAfter(2000, instant);
  return (
    <div className="flex h-full flex-col">
      <PageTitle sub="Rate the driver and vehicle separately.">How was your ride?</PageTitle>
      <div className="grid gap-3 @lg:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-muted-foreground">Driver · Jordan R.</p>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                initial={instant ? false : { scale: 0.6, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: instant ? 0 : 0.3 + i * 0.15 }}
              >
                <Star className="size-6 fill-primary text-primary" />
              </motion.span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <p className="mb-2 text-sm text-muted-foreground">Add a tip</p>
          <div className="grid grid-cols-4 gap-1 rounded-full bg-muted p-1">
            {TIPS.map((t, i) => (
              <span key={t} className={cn("relative rounded-full py-1.5 text-center font-mono text-xs", tipped && i === 2 ? "text-foreground" : "text-muted-foreground")}>
                {tipped && i === 2 && (
                  <motion.span layoutId="tip-pick-web" className="absolute inset-0 rounded-full bg-background shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                )}
                <span className="relative">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <motion.p
        initial={false}
        animate={tipped ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.35, delay: instant ? 0 : 0.2, ease: EASE }}
        className="mt-auto rounded-xl bg-primary/15 py-3 text-center text-sm font-medium text-brand-ink"
      >
        Thanks! Your $8.00 tip goes 100% to Jordan.
      </motion.p>
    </div>
  );
}
