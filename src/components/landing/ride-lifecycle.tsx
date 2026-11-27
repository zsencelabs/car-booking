"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";

type Step = { status: string; title: string; text: string };

export function RideLifecycle({ steps }: { steps: readonly Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 60%"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length))));
  });

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">01 — For riders</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["From request", "to receipt."]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Every booking moves through the same clear set of states. You always know who is coming, in what car, and when you&apos;ll be charged.
          </p>
        </div>

        <div ref={ref} className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="hidden lg:block">
            <div className="sticky top-32 max-w-[460px]">
              <PhoneMock steps={steps} active={active} />
            </div>
          </div>

          <ol className="relative">
            <span aria-hidden className="absolute left-[11px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:block" />
            {steps.map((s, i) => (
              <li key={s.status} className="relative flex gap-6 pb-14 last:pb-0 lg:min-h-[36vh]">
                <span
                  className={cn(
                    "relative z-10 mt-1 hidden size-6 shrink-0 place-items-center rounded-full border bg-background font-mono text-[10px] transition-colors duration-500 md:grid",
                    i <= active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {i < active ? <Check className="size-3" /> : i + 1}
                </span>
                <div className={cn("transition-opacity duration-500 lg:opacity-30", i === active && "lg:opacity-100")}>
                  <p className="font-mono text-xs text-brand-ink">{s.status}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-lg text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function PhoneMock({ steps, active }: { steps: readonly Step[]; active: number }) {
  const progress = (active + 1) / steps.length;
  const last = active === steps.length - 1;
  return (
    <div className="dark rounded-[2.25rem] border bg-background p-3 text-foreground shadow-2xl shadow-black/20">
      <div className="overflow-hidden rounded-[1.75rem] border bg-card">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="eyebrow">Booking #DO-20481</span>
          <span className="font-mono text-xs text-muted-foreground">SUV</span>
        </div>

        <div className="relative mx-5 mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>

        <div className="h-24 px-5 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[active].status}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{steps[active].status}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-3 border-t p-5 text-sm">
          <Row label="Pickup" value="LAX, 1 World Way" />
          <Row label="Drop-off" value="Santa Monica Pier" />
        </div>

        <AnimatePresence initial={false}>
          {active >= 1 && (
            <motion.div
              key="driver"
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 border-t p-5">
                <span className="grid size-10 place-items-center rounded-full bg-muted font-medium">JR</span>
                <div className="flex-1">
                  <p className="font-medium">Jordan R.</p>
                  <p className="text-xs text-muted-foreground">Black Chevrolet Tahoe · 8KZM214</p>
                </div>
                <span className="flex items-center gap-1 font-mono text-xs"><Star className="size-3 fill-primary text-primary" />4.97</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t bg-muted/40 p-5">
          <span className="text-sm text-muted-foreground">{last ? "Charged" : "Estimated fare"}</span>
          <span className="font-mono text-lg font-semibold">{last ? "$38.40" : "$34–39"}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
