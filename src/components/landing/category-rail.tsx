"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Briefcase, User } from "lucide-react";
import type { VehicleCategory } from "@/types";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";

const usd = (n: number) => `$${n.toFixed(2)}`;

export function CategoryRail({ categories }: { categories: VehicleCategory[] }) {
  const [activeId, setActiveId] = useState(categories[0].id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <section className="dark relative isolate overflow-hidden bg-background py-24 text-foreground md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5">02 — The fleet</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Six classes.", "One standard."]} />
            </h2>
          </div>
          <Link href="/categories" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            Compare all vehicles
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <ul role="listbox" aria-label="Vehicle classes" className="border-t" onMouseLeave={() => undefined}>
            {categories.map((c, i) => {
              const selected = c.id === activeId;
              return (
                <li key={c.id} className="border-b">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveId(c.id)}
                    onFocus={() => setActiveId(c.id)}
                    onClick={() => setActiveId(c.id)}
                    className="relative flex w-full items-center gap-6 py-5 text-left outline-none"
                  >
                    {selected && (
                      <motion.span layoutId="cat-hl" className="absolute inset-y-0 -left-4 -right-4 -z-10 rounded-xl bg-muted/60" transition={{ type: "spring", stiffness: 400, damping: 36 }} />
                    )}
                    <span className="w-6 font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    <span className={cn("flex-1 text-3xl font-semibold tracking-tight transition-colors md:text-4xl", selected ? "text-foreground" : "text-muted-foreground/60")}>
                      {c.name}
                    </span>
                    <span className="hidden font-mono text-sm text-muted-foreground sm:block">from {usd(c.baseFare)}</span>
                    <span className={cn("font-mono text-xs transition-colors", selected ? "text-primary" : "text-muted-foreground")}>{c.eta}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-3xl border bg-card p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <p className="eyebrow">{active.name}</p>
                  <p className="mt-4 text-xl leading-snug">{active.description}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{active.examples}</p>

                  <div className="mt-8 space-y-5">
                    <Capacity label="Passengers" icon={<User className="size-3.5" />} n={active.passengers} max={8} />
                    <Capacity label="Luggage" icon={<Briefcase className="size-3.5" />} n={active.luggage} max={8} />
                  </div>

                  <dl className="mt-8 grid grid-cols-3 gap-4 border-t pt-6 font-mono text-sm">
                    <div><dt className="text-xs text-muted-foreground">Base</dt><dd className="mt-1">{usd(active.baseFare)}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Per mile</dt><dd className="mt-1">{usd(active.perMile)}</dd></div>
                    <div><dt className="text-xs text-muted-foreground">Per min</dt><dd className="mt-1">{usd(active.perMinute)}</dd></div>
                  </dl>
                </motion.div>
              </AnimatePresence>
              <Link
                href={`/book?categoryId=${active.id}`}
                className="mt-8 flex h-11 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Book {active.name}
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Estimates only. Final fare is calculated by the platform at booking.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capacity({ label, icon, n, max }: { label: string; icon: React.ReactNode; n: number; max: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">{icon}{label}</span>
        <span className="font-mono text-foreground">{n}</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <motion.span
            key={i}
            className="h-2 rounded-full"
            initial={false}
            animate={{ backgroundColor: i < n ? "var(--primary)" : "var(--muted)" }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
          />
        ))}
      </div>
    </div>
  );
}
