"use client";

import { motion } from "motion/react";
import { EASE, MaskLines } from "./reveal";

type Group = { group: string; items: readonly string[] };
type Feature = { title: string; text: string };

export function SafetyChecklist({ groups, features }: { groups: readonly Group[]; features: readonly Feature[] }) {
  return (
    <section className="border-t py-24 md:py-32">
      <div className="mx-auto grid max-w-site gap-16 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow mb-5">05 — Safety</p>
          <h2 className="display text-4xl md:text-6xl">
            <MaskLines lines={["Nobody drives", "until every", "check passes."]} />
          </h2>
          <dl className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title}>
                <dt className="text-sm font-medium">{f.title}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.group}>
              <p className="eyebrow mb-4">{g.group}</p>
              <ul className="border-t">
                {g.items.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center justify-between gap-4 border-b py-4"
                    initial="idle"
                    whileInView="done"
                    viewport={{ once: true, margin: "-25% 0px -25% 0px" }}
                  >
                    <span className="text-lg tracking-tight">{item}</span>
                    <span className="flex items-center gap-3">
                      <motion.span
                        className="grid font-mono text-xs"
                      >
                        <motion.span variants={{ idle: { opacity: 1 }, done: { opacity: 0 } }} transition={{ delay: 0.15 + i * 0.12 }} className="col-start-1 row-start-1 text-right text-muted-foreground">Pending</motion.span>
                        <motion.span variants={{ idle: { opacity: 0 }, done: { opacity: 1 } }} transition={{ delay: 0.15 + i * 0.12 }} className="col-start-1 row-start-1 text-right text-brand-ink">Verified</motion.span>
                      </motion.span>
                      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                        <circle
                          cx="12" cy="12" r="10.5" fill="none" strokeWidth="1.5"
                          className="stroke-border"
                        />
                        <motion.circle
                          cx="12" cy="12" r="11" className="fill-primary"
                          variants={{ idle: { scale: 0 }, done: { scale: 1 } }}
                          style={{ transformBox: "fill-box", transformOrigin: "center" }}
                          transition={{ delay: 0.1 + i * 0.12, duration: 0.35, ease: EASE }}
                        />
                        <motion.path
                          d="M7.5 12.5l3 3 6-6.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="stroke-primary-foreground"
                          variants={{ idle: { pathLength: 0 }, done: { pathLength: 1 } }}
                          transition={{ delay: 0.3 + i * 0.12, duration: 0.35 }}
                        />
                      </svg>
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            Expiring documents are tracked automatically. A lapsed license, registration or insurance policy removes the driver or vehicle from dispatch until it&apos;s renewed.
          </p>
        </div>
      </div>
    </section>
  );
}
