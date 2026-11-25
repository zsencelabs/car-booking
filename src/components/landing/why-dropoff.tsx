"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";

/** Shared clock: ticks every `ms` while the section is on screen. */
function useTick(active: boolean, ms = 2600) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setT((n) => n + 1), ms);
    return () => clearInterval(i);
  }, [active, ms]);
  return t;
}

type VisualProps = { tick: number; still: boolean };

const BENEFITS: { title: string; text: string; Visual: (p: VisualProps) => React.ReactNode }[] = [
  { title: "Pay after you arrive", text: "Your card is only charged once the trip is complete.", Visual: PayVisual },
  { title: "Verified, every ride", text: "ID, license, driving record and background checks before anyone drives.", Visual: VerifyVisual },
  { title: "Upfront estimates", text: "See a fare range for every vehicle class before you book.", Visual: EstimateVisual },
  { title: "Real choice of rides", text: "Six vehicle classes from independent drivers, local fleets and our own cars.", Visual: ChoiceVisual },
  { title: "Now or later", text: "Ride now or schedule ahead, one-way or round-trip.", Visual: ToggleVisual },
  { title: "Fair to drivers", text: "Partner fleets keep 80% of each fare, before processing fees and adjustments, and 100% of your tip goes to your driver.", Visual: SplitVisual },
];

export function WhyDropoff() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const still = !!useReducedMotion();
  const tick = useTick(inView && !still);

  return (
    <section className="dark relative isolate overflow-hidden bg-background py-24 text-foreground md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">04 — Why dropoff</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Why users", <span key="b" className="text-muted-foreground">choose dropoff.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            One marketplace for independent drivers, local fleets and our own cars, with the same rules for every ride: verified
            people, approved vehicles and no charge until you arrive.
          </p>
        </div>

        {/* hairlines between cells only: the 1px gap shows the border colour behind */}
        <div ref={ref} className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ title, text, Visual }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: EASE }}
              className="group bg-background px-1 py-8 sm:p-8 lg:p-10"
            >
              <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
              <div className="mt-5 flex h-16 items-center">
                <Visual tick={tick} still={still} />
              </div>
              <h3 className="relative mt-6 inline-block text-xl font-semibold tracking-tight">
                {title}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── micro-visuals ───────────── */

function PayVisual({ tick, still }: VisualProps) {
  const paid = still || tick % 2 === 1;
  return (
    <div className="w-full max-w-[260px]">
      <div className="flex items-baseline justify-between">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={paid ? "paid" : "trip"}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn("font-mono text-2xl font-semibold tracking-tight", !paid && "text-muted-foreground")}
          >
            {paid ? "$40.00" : "$0.00"}
          </motion.span>
        </AnimatePresence>
        <span className="text-[11px] text-muted-foreground">{paid ? "charged at drop-off" : "on trip"}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          key={tick}
          className="h-full rounded-full bg-primary"
          initial={{ width: still ? "100%" : paid ? "100%" : "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: paid ? 0 : 2.2, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

const CHECKS = ["Government ID", "Driver's license", "Driving record", "Background check"];

function VerifyVisual({ tick, still }: VisualProps) {
  return (
    <ul key={still ? "s" : tick % 2} className="grid w-full max-w-[280px] grid-cols-2 gap-x-4 gap-y-1.5">
      {CHECKS.map((c, i) => (
        <li key={c} className="flex items-center gap-1.5 text-xs">
          <motion.span
            initial={still ? false : { scale: 0.4, backgroundColor: "var(--muted)" }}
            animate={{ scale: 1, backgroundColor: "var(--primary)" }}
            transition={{ duration: 0.35, delay: still ? 0 : 0.2 + i * 0.3, ease: EASE }}
            className="grid size-4 shrink-0 place-items-center rounded-full text-primary-foreground"
          >
            <Check className="size-2.5" strokeWidth={3.5} />
          </motion.span>
          <span className="truncate text-muted-foreground">{c}</span>
        </li>
      ))}
    </ul>
  );
}

function EstimateVisual({ tick, still }: VisualProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="relative overflow-hidden rounded-full border px-4 py-2 font-mono text-lg font-semibold tracking-tight">
        $44–49
        {!still && (
          <motion.span
            key={tick}
            aria-hidden
            className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-primary/35 to-transparent"
            initial={{ left: "-60%" }}
            animate={{ left: "130%" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        )}
      </span>
      <span className="text-xs leading-tight text-muted-foreground">SUV · estimate<br />before you book</span>
    </div>
  );
}

const CLASSES = ["Economy", "Comfort", "Premium", "SUV", "Luxury", "Van"];

function ChoiceVisual({ tick, still }: VisualProps) {
  const sel = still ? 3 : tick % CLASSES.length;
  return (
    <div className="flex max-w-[300px] flex-wrap gap-1.5">
      {CLASSES.map((c, i) => (
        <span key={c} className={cn("relative rounded-full border px-2.5 py-1 text-xs transition-colors", i === sel ? "border-transparent text-primary-foreground" : "text-muted-foreground")}>
          {i === sel && (
            <motion.span layoutId="why-class" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
          )}
          <span className="relative">{c}</span>
        </span>
      ))}
    </div>
  );
}

const MODES = ["Ride now", "Schedule"];

function ToggleVisual({ tick, still }: VisualProps) {
  const sel = still ? 1 : tick % 2;
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1 rounded-full border p-1">
        {MODES.map((m, i) => (
          <span key={m} className={cn("relative rounded-full px-3.5 py-1.5 text-xs", i === sel ? "text-primary-foreground" : "text-muted-foreground")}>
            {i === sel && (
              <motion.span layoutId="why-mode" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{m}</span>
          </span>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={sel}
          initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.25 }}
          className="font-mono text-[11px] text-muted-foreground"
        >
          {sel ? "Fri · 6:30 PM" : "~4 min away"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function SplitVisual({ tick, still }: VisualProps) {
  const k = still ? "s" : tick % 2;
  return (
    <div className="w-full max-w-[280px] space-y-1.5">
      <div className="flex h-5 gap-0.5 overflow-hidden rounded-md">
        <motion.span
          key={`p${k}`}
          className="flex items-center overflow-hidden whitespace-nowrap rounded-sm bg-foreground pl-2 font-mono text-[10px] text-background"
          initial={{ width: still ? "80%" : "0%" }} animate={{ width: "80%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          Provider 80%
        </motion.span>
        <span className="flex flex-1 items-center justify-center rounded-sm bg-muted font-mono text-[10px] text-muted-foreground">20%</span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-md border border-dashed p-0.5">
        <motion.span
          key={`t${k}`}
          className="flex items-center overflow-hidden whitespace-nowrap rounded-sm bg-primary pl-2 font-mono text-[10px] text-primary-foreground"
          initial={{ width: still ? "100%" : "0%" }} animate={{ width: "100%" }}
          transition={{ duration: 0.9, delay: still ? 0 : 0.4, ease: EASE }}
        >
          Tip · 100% to driver
        </motion.span>
      </div>
    </div>
  );
}
