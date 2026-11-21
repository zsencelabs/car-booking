"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/landing/reveal";
import type { DashboardChart, DashboardRow, PanelData } from "@/lib/mock/dashboards";
import { cn } from "@/lib/utils";

const POSITIVE = new Set(["Confirmed", "Paid", "Approved", "Active", "On", "Default", "New", "Driver assigned", "Accepted", "Resolved"]);
const NEGATIVE = new Set(["Disputed"]);

export function StatusPill({ label }: { label: string }) {
  return (
    <span className={cn(
      "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-[11px] font-medium",
      POSITIVE.has(label) ? "bg-primary/20 text-brand-ink" : NEGATIVE.has(label) ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
    )}>
      {label}
    </span>
  );
}

function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    const el = ref.current;
    if (!match || !el || reduce) return;
    const [, prefix, raw, suffix] = match;
    const target = Number(raw.replace(/,/g, ""));
    const decimals = raw.split(".")[1]?.length ?? 0;
    const controls = animate(0, target, {
      duration: 1,
      ease: EASE,
      onUpdate: (v) => { el.textContent = `${prefix}${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`; },
      onComplete: () => { el.textContent = value; },
    });
    return () => { controls.stop(); el.textContent = value; };
  }, [value, reduce]);

  return <span ref={ref} className="tabular-nums">{value}</span>;
}

function BarChart({ chart }: { chart: DashboardChart }) {
  const [hover, setHover] = useState<number | null>(null);
  const top = Math.max(...chart.bars.map((b) => b.value));
  const format = (n: number) => `${chart.prefix ?? ""}${n.toLocaleString("en-US")}`;
  const shown = chart.bars[hover ?? chart.bars.length - 1];

  return (
    <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{chart.title}</h2>
          <p className="text-xs text-muted-foreground">{chart.caption}</p>
        </div>
        <p className="text-right">
          <span className="block text-xl font-semibold tabular-nums tracking-tight">{format(shown.value)}</span>
          <span className="text-xs text-muted-foreground">{shown.label}</span>
        </p>
      </div>
      <div aria-hidden className="mt-4 flex h-44 items-end gap-2 border-b sm:gap-3" onMouseLeave={() => setHover(null)}>
        {chart.bars.map((b, i) => (
          <div key={b.label} onMouseEnter={() => setHover(i)} className="flex h-full flex-1 items-end justify-center">
            <motion.span
              className={cn("block w-full max-w-10 origin-bottom rounded-t transition-colors duration-200", hover === i ? "bg-primary" : hover === null && i === chart.bars.length - 1 ? "bg-primary" : "bg-foreground/85")}
              style={{ height: `${(b.value / top) * 100}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.05, ease: EASE }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden className="mt-2 flex gap-2 sm:gap-3">
        {chart.bars.map((b) => <span key={b.label} className="flex-1 text-center font-mono text-[10px] text-muted-foreground">{b.label}</span>)}
      </div>
      <table className="sr-only">
        <caption>{chart.title}, {chart.caption}</caption>
        <tbody>{chart.bars.map((b) => <tr key={b.label}><th scope="row">{b.label}</th><td>{format(b.value)}</td></tr>)}</tbody>
      </table>
    </section>
  );
}

function Row({ row, index }: { row: DashboardRow; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.12 + index * 0.05, ease: EASE }}
      className="flex items-center justify-between gap-4 py-3.5"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{row.title}</p>
        <p className="truncate text-xs text-muted-foreground">{row.meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {row.value && <span className="text-sm font-semibold tabular-nums">{row.value}</span>}
        {row.status && <StatusPill label={row.status} />}
      </div>
    </motion.li>
  );
}

export function PanelView({ panel }: { panel: PanelData }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{panel.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{panel.text}</p>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {panel.stats.map((s, i) => (
            <motion.div
              key={s.v}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5"
            >
              <dt className="text-xs text-muted-foreground">{s.v}</dt>
              <dd className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl"><CountUp value={s.k} /></dd>
            </motion.div>
          ))}
        </dl>

        {panel.chart && <BarChart chart={panel.chart} />}

        <div className={cn("grid gap-5", panel.sections.length > 1 && "lg:grid-cols-2")}>
          {panel.sections.map((section) => (
            <section key={section.title} className="min-w-0 rounded-2xl bg-card px-5 pb-2 pt-5 ring-1 ring-foreground/5">
              <h2 className="text-[15px] font-semibold tracking-tight">{section.title}</h2>
              <ul className="mt-2 divide-y">
                {section.rows.map((row, i) => <Row key={row.title} row={row} index={i} />)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
