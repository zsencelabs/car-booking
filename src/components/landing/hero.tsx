"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { QuickBookForm } from "@/components/booking/quick-book-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";
import { LiveDispatchMap } from "./live-dispatch-map";

const STATS = [
  { k: "$0", v: "charged before drop-off" },
  { k: "100%", v: "of tips go to your driver" },
  { k: "6", v: "vehicle classes, economy to van" },
];

export function Hero({ brand, driveAction }: { brand: string; driveAction?: React.ReactNode }) {
  return (
    <section className="dark relative isolate overflow-hidden border-b bg-background text-foreground">
      {/* Minimal backdrop: soft neutral light from the top + faint film grain. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,color-mix(in_oklch,var(--foreground)_9%,transparent),transparent_70%)]" />
        <div className="grain absolute inset-0 opacity-[0.06]" />
      </div>

      <div className="mx-auto max-w-site px-4 pb-16 pt-12 text-center lg:pb-24 lg:pt-14">
        <motion.p
          className="eyebrow mb-6 inline-flex items-center gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        >
          <span className="h-px w-8 bg-primary" />
          Rides across the United States
          <span className="h-px w-8 bg-primary" />
        </motion.p>

        <h1 className="display mx-auto max-w-3xl text-[clamp(2.25rem,5vw,4.25rem)]">
          <MaskLines lines={["We’re on", <span key="a" className="text-primary">your schedule.</span>]} />
        </h1>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
        >
          {brand} matches you with background-checked drivers in approved, insured vehicles — independent drivers, local fleets and our own cars.
        </motion.p>

        <motion.div
          className="mx-auto mt-8 max-w-5xl"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
        >
          <QuickBookForm layout="bar" submitLabel="Search" />
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link href="/how-it-works" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-full px-6")}>
            How it works
          </Link>
          {driveAction}
        </motion.div>

        {/* wide live map strip */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.75, ease: EASE }}
          className="relative mt-12 text-left lg:mt-16"
        >
          <LiveDispatchMap />
        </motion.div>

        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 divide-x">
          {STATS.map((s, i) => (
            <motion.div
              key={s.k} className="px-3 sm:px-6"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              <dt className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.k}</dt>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground">{s.v}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
