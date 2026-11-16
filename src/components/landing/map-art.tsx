"use client";

import { useReducedMotion } from "motion/react";

/**
 * Dark "night mode" map primitives, styled after ride-hailing apps.
 * Streets are the gaps between filled city blocks (not stroked grid lines),
 * which is how real vector maps read at night.
 */

const BLOCK = "fill-white/[0.045]";
const PARK = "fill-[oklch(0.215_0.025_150)]";
const WATER = "fill-[oklch(0.2_0.03_245)]";

/** Deterministic pseudo-random in [0,1) for a block coordinate. */
const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function CityBlocks({
  xs, ys, avenuesX = [], avenuesY = [], minor = 7, avenue = 15,
}: {
  xs: readonly number[]; ys: readonly number[];
  avenuesX?: readonly number[]; avenuesY?: readonly number[];
  minor?: number; avenue?: number;
}) {
  const half = (v: number, aves: readonly number[]) => (aves.includes(v) ? avenue : minor) / 2;
  const rects: React.ReactNode[] = [];
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i] + half(xs[i], avenuesX);
      const x1 = xs[i + 1] - half(xs[i + 1], avenuesX);
      const y0 = ys[j] + half(ys[j], avenuesY);
      const y1 = ys[j + 1] - half(ys[j + 1], avenuesY);
      const w = x1 - x0;
      const h = y1 - y0;
      if (w <= 0 || h <= 0) continue;
      const r = hash(i, j);
      const key = `${i}-${j}`;
      if (r < 0.07) {
        rects.push(<rect key={key} x={x0} y={y0} width={w} height={h} rx={3} className={PARK} />);
      } else if (r < 0.35 && w > 40) {
        // split into two lots side by side
        const m = x0 + w * (0.4 + hash(j, i) * 0.2);
        rects.push(<rect key={`${key}a`} x={x0} y={y0} width={m - x0 - 1.5} height={h} rx={2} className={BLOCK} />);
        rects.push(<rect key={`${key}b`} x={m + 1.5} y={y0} width={x1 - m - 1.5} height={h} rx={2} className={BLOCK} />);
      } else if (r < 0.6 && h > 40) {
        // split into two lots stacked
        const m = y0 + h * (0.4 + hash(j, i) * 0.2);
        rects.push(<rect key={`${key}a`} x={x0} y={y0} width={w} height={m - y0 - 1.5} rx={2} className={BLOCK} />);
        rects.push(<rect key={`${key}b`} x={x0} y={m + 1.5} width={w} height={y1 - m - 1.5} rx={2} className={BLOCK} />);
      } else {
        rects.push(<rect key={key} x={x0} y={y0} width={w} height={h} rx={2} className={BLOCK} />);
      }
    }
  }
  return <g>{rects}</g>;
}

export const Water = ({ d }: { d: string }) => <path d={d} className={WATER} />;

/** Highway with a dark casing so it reads above blocks and water (a bridge where it crosses). */
export function Highway({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} className="stroke-background" strokeWidth={16} />
      <path d={d} className="stroke-white/[0.16]" strokeWidth={10} />
      <path d={d} className="stroke-white/[0.07]" strokeWidth={1} strokeDasharray="10 12" />
    </g>
  );
}

/** Ambient cars using native SVG motion (no JS per frame). Hidden for reduced motion. */
export function Traffic({ cars }: { cars: { path: string; dur: number; begin?: number }[] }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <g>
      {cars.map((c, i) => (
        <circle key={i} r={2.5} className="fill-white/55">
          <animateMotion dur={`${c.dur}s`} begin={`-${c.begin ?? 0}s`} repeatCount="indefinite" path={c.path} />
        </circle>
      ))}
    </g>
  );
}
