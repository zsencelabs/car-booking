"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { EASE } from "@/components/landing/reveal";
import { usd } from "@/lib/mock/fare";
import { cn } from "@/lib/utils";

const BINS = 28;

export function PriceHistogram({ label, prices, bounds, value, onChange }: {
  label: string;
  prices: number[];
  bounds: [number, number];
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [min, max] = bounds;
  const [lo, hi] = value;
  const span = Math.max(1, max - min);
  const pct = (n: number) => ((n - min) / span) * 100;

  const bars = useMemo(() => {
    const counts = Array.from({ length: BINS }, () => 0);
    prices.forEach((p) => {
      const i = Math.min(BINS - 1, Math.floor(((p - min) / Math.max(1, max - min)) * BINS));
      counts[i] += 1;
    });
    // A gaussian curve lets a small sample read as a distribution rather than noise.
    const smooth = counts.map((_, i) => counts.reduce((sum, c, j) => sum + c * Math.exp(-((i - j) ** 2) / (2 * 2.2 ** 2)), 0));
    const top = Math.max(...smooth, 1);
    return smooth.map((v, i) => ({ height: 10 + (v / top) * 90, count: counts[i], from: min + (i / BINS) * (max - min), to: min + ((i + 1) / BINS) * (max - min) }));
  }, [prices, min, max]);

  const thumb = "range-thumb pointer-events-none absolute inset-x-0 bottom-0 h-4 w-full appearance-none bg-transparent outline-none";
  const hovered = hover === null ? null : bars[hover];

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute -top-1 left-0 right-0 h-4 text-center font-mono text-[10px] text-muted-foreground">
          {hovered && `${usd(hovered.from)} to ${usd(hovered.to)} · ${hovered.count}`}
        </div>
        <div className="flex h-24 items-end gap-[2px] pb-2 pt-4" onMouseLeave={() => setHover(null)}>
          {bars.map((b, i) => {
            const on = b.to >= lo && b.from <= hi;
            return (
              <div key={i} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
                <motion.span
                  className={cn("block w-full origin-bottom rounded-t-[2px] transition-colors duration-200", on ? (hover === i ? "bg-primary" : "bg-foreground") : "bg-border")}
                  style={{ height: `${b.height}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.012, ease: EASE }}
                />
              </div>
            );
          })}
        </div>
        <div className="relative h-4">
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
          <span className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
          <input
            type="range" aria-label={`Minimum ${label.toLowerCase()}`} min={min} max={max} step={1} value={lo}
            onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 1), hi])}
            className={thumb}
          />
          <input
            type="range" aria-label={`Maximum ${label.toLowerCase()}`} min={min} max={max} step={1} value={hi}
            onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 1)])}
            className={thumb}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {([["From", lo], ["To", hi]] as const).map(([k, n]) => (
          <div key={k} className="flex items-center justify-between rounded-lg bg-muted/70 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{k}</span>
            <span className="text-sm font-semibold tabular-nums">${n.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
