"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type MotionValue,
} from "motion/react";
import { BadgeCheck, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CityBlocks, Highway, Traffic, Water } from "./map-art";
import { EASE } from "./reveal";

/*
 * A looping story of one dropoff ride (PRD §4.1):
 * request → verified driver matched → trip → charged after drop-off.
 * Map coordinates live inside a city grid rotated -14° around (300,150);
 * every route coordinate sits on a street centreline from XS / YS.
 */

const ANGLE = -14;
const ROT = `rotate(${ANGLE} 300 150)`;

const XS = [-760, -680, -600, -520, -430, -360, -300, -220, -130, -40, 20, 80, 160, 210, 280, 360, 440, 510, 590, 680, 760, 860, 960, 1060, 1160, 1260] as const;
const YS = [-420, -340, -260, -160, -90, -20, 40, 80, 120, 190, 250, 320, 400, 480, 560, 640] as const;
const AVE_X = [-300, 160, 440, 860] as const;
const AVE_Y = [-160, 120, 320] as const;

const APPROACH = "M80 40 L80 120 L160 120";
const ROUTE = "M160 120 L280 120 L280 80 L440 80";
/** The car parks just short of the drop-off pin so the pin stays visible. */
const STOP = 0.93;
const PICKUP = { x: 160, y: 120 };
const DEST = { x: 440, y: 80 };

// screen-space scenery
const HIGHWAY = "M-420 20 C-120 70, 160 60, 380 8 S760 30, 1150 0";
const RIVER = "M720 -80 C770 40 700 170 780 420 L880 420 C800 170 870 40 820 -80 Z";

/** Grid point → screen point (for labels that must stay level). */
function toScreen(x: number, y: number) {
  const a = (ANGLE * Math.PI) / 180;
  const dx = x - 300;
  const dy = y - 150;
  return { x: 300 + dx * Math.cos(a) - dy * Math.sin(a), y: 150 + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** Idle drivers. `axis` is the street they drift along; `tag` labels the supply type. */
const IDLE = [
  { x: 230, y: 40, axis: "x", tag: "Fleet" },
  { x: 360, y: 170, axis: "y", tag: "Independent" },
  { x: 520, y: 190, axis: "x" },
  { x: -40, y: 10, axis: "y" },
  { x: 600, y: 250, axis: "x" },
  { x: -130, y: 150, axis: "y" },
  { x: -260, y: 40, axis: "x" },
  { x: 680, y: 60, axis: "y" },
  { x: 100, y: 250, axis: "x" },
  { x: 760, y: -20, axis: "x" },
] as const;

const PHASES = [
  { label: "Finding a verified driver…", ms: 2600 },
  { label: "Driver matched · 3 min", ms: 2800 },
  { label: "On trip · arriving 6:52 PM", ms: 4000 },
  { label: "Arrived · charged after drop-off", ms: 3000 },
] as const;

const STEPS = [
  { title: "Requested", sub: "Pickup set · 1 passenger" },
  { title: "Driver matched", sub: "Verified · 3 min away" },
  { title: "On trip", sub: "Arriving 6:52 PM" },
  { title: "Paid", sub: "Charged after drop-off" },
] as const;

const XL = "(min-width: 1280px)";
function useIsXL() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(XL);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(XL).matches,
    () => true,
  );
}

export function LiveDispatchMap({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-40px" });
  const reduce = useReducedMotion();
  const xl = useIsXL();
  const glowId = useId();
  const [phase, setPhase] = useState(0);
  const shown = reduce ? 2 : phase;

  // Phase clock: only ticks while the map is on screen.
  useEffect(() => {
    if (!inView || reduce) return;
    let t: ReturnType<typeof setTimeout>;
    const next = (p: number) => {
      t = setTimeout(() => {
        const n = (p + 1) % PHASES.length;
        setPhase(n);
        next(n);
      }, PHASES[p].ms);
    };
    next(phase);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart from the current phase only on visibility changes
  }, [inView, reduce]);

  // Matched car position + heading.
  const approachRef = useRef<SVGPathElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const carX = useMotionValue(80);
  const carY = useMotionValue(40);
  const carR = useMotionValue(90);

  useEffect(() => {
    const approach = approachRef.current;
    const route = routeRef.current;
    if (!approach || !route) return;
    const place = (path: SVGPathElement, t: number) => {
      const len = path.getTotalLength();
      const a = path.getPointAtLength(Math.min(len, t * len));
      const b = path.getPointAtLength(Math.min(len, t * len + 2));
      carX.set(a.x);
      carY.set(a.y);
      if (b.x !== a.x || b.y !== a.y) carR.set((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
    };
    if (shown === 0) { place(approach, 0); return; }
    if (shown === 3) { place(route, STOP); return; }
    if (reduce) { place(route, 0.55); return; }
    const path = shown === 1 ? approach : route;
    const controls = animate(0, 1, {
      duration: shown === 1 ? 2.2 : 3.4,
      delay: shown === 1 ? 0.4 : 0.1,
      ease: "easeInOut",
      onUpdate: (t) => place(path, shown === 2 ? t * STOP : t),
    });
    return () => controls.stop();
  }, [shown, reduce, carX, carY, carR]);

  const P = toScreen(PICKUP.x, PICKUP.y);
  const D = toScreen(DEST.x, DEST.y);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* ── map ── */}
      <div className="map-fade relative h-[300px] overflow-hidden sm:h-[420px] xl:h-[600px]">
        <svg
          viewBox={xl ? "-160 -30 1160 360" : "-300 -10 1120 330"}
          preserveAspectRatio={xl ? "xMinYMid slice" : "xMidYMid slice"}
          className="absolute inset-0 size-full"
          aria-hidden="true"
          fill="none"
        >
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* city */}
          <g transform={ROT}>
            <CityBlocks xs={XS} ys={YS} avenuesX={AVE_X} avenuesY={AVE_Y} />
            <Traffic
              cars={[
                { path: "M-760 190 L1260 190", dur: 24, begin: 4 },
                { path: "M1260 -20 L-760 -20", dur: 28, begin: 12 },
                { path: "M510 640 L510 -420", dur: 20, begin: 6 },
                { path: "M-130 -420 L-130 640", dur: 22, begin: 15 },
                { path: "M-760 320 L1260 320", dur: 26, begin: 9 },
              ]}
            />
          </g>
          <Water d={RIVER} />
          <Highway d={HIGHWAY} />
          <Traffic cars={[{ path: HIGHWAY, dur: 16, begin: 3 }, { path: HIGHWAY, dur: 16, begin: 11 }]} />

          <g transform={ROT}>
            {/* idle supply */}
            {IDLE.map((c, i) => (
              <motion.g
                key={i}
                animate={{
                  opacity: shown === 0 ? 1 : 0.35,
                  ...(reduce ? {} : c.axis === "x" ? { x: [0, 16, 0] } : { y: [0, -16, 0] }),
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  x: { duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 5 + (i % 5), repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <g transform={`translate(${c.x} ${c.y}) rotate(${c.axis === "x" ? 0 : 90})`}>
                  <CarShape className="fill-white/75" />
                </g>
              </motion.g>
            ))}

            {/* approach (driver → pickup) */}
            <motion.path
              ref={approachRef}
              d={APPROACH}
              className="stroke-white/70"
              strokeWidth={2.5}
              strokeDasharray="1 7"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: shown >= 1 ? 1 : 0, opacity: shown === 1 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            />

            {/* planned route (dashed) → driven route (lime + glow) */}
            <motion.path
              d={ROUTE}
              className="stroke-white/35"
              strokeWidth={2.5}
              strokeDasharray="1 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ opacity: shown >= 1 ? 1 : 0 }}
            />
            <motion.path
              d={ROUTE}
              className="stroke-primary"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${glowId})`}
              initial={false}
              animate={{ pathLength: shown >= 2 ? 1 : 0, opacity: shown >= 2 ? 0.45 : 0 }}
              transition={shown === 2 && !reduce ? { duration: 3.4, delay: 0.1, ease: "easeInOut" } : { duration: 0 }}
            />
            <motion.path
              ref={routeRef}
              d={ROUTE}
              className="stroke-primary"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: shown >= 2 ? 1 : 0 }}
              transition={shown === 2 && !reduce ? { duration: 3.4, delay: 0.1, ease: "easeInOut" } : { duration: 0 }}
            />

            {/* pickup with radar */}
            {shown === 0 && !reduce &&
              [0, 1].map((i) => (
                <motion.circle
                  key={i}
                  cx={PICKUP.x} cy={PICKUP.y}
                  className="stroke-primary" strokeWidth={1.5}
                  initial={{ r: 8, opacity: 0.9 }}
                  animate={{ r: 60, opacity: 0 }}
                  transition={{ duration: 2, delay: i, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            <g style={{ filter: "drop-shadow(0 3px 6px rgb(0 0 0 / 0.6))" }}>
              <circle cx={PICKUP.x} cy={PICKUP.y} r={10} className="fill-background stroke-primary" strokeWidth={3.5} />
              <circle cx={PICKUP.x} cy={PICKUP.y} r={3.5} className="fill-primary" />
            </g>

            {/* destination */}
            <motion.g
              initial={false}
              animate={{ scale: shown === 3 ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
              style={{ transformBox: "fill-box", transformOrigin: "center", filter: "drop-shadow(0 3px 6px rgb(0 0 0 / 0.6))" }}
            >
              <rect x={DEST.x - 10} y={DEST.y - 10} width={20} height={20} rx={5} className={cn("transition-colors duration-300", shown === 3 ? "fill-primary" : "fill-foreground")} />
              {shown === 3 ? (
                <path d={`M${DEST.x - 4.5} ${DEST.y} l3 3 l6 -6.5`} className="stroke-primary-foreground" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <rect x={DEST.x - 3.5} y={DEST.y - 3.5} width={7} height={7} rx={1.5} className="fill-background" />
              )}
            </motion.g>

            {/* matched driver */}
            <MatchedCar x={carX} y={carY} r={carR} active={shown >= 1} />
          </g>

          {/* level labels (screen space) */}
          <MapLabel x={P.x - 8} y={P.y + 28} anchor="start" prefix="Pickup" text="Union Station" />
          <MapLabel x={D.x - 18} y={D.y - 8} anchor="end" prefix="Drop-off" text="1400 Market St" />
          <AnimatePresence>
            {shown === 0 &&
              IDLE.map((c) => {
                if (!("tag" in c)) return null;
                const s = toScreen(c.x, c.y);
                return (
                  <motion.g key={c.tag} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }}>
                    <MapLabel x={s.x} y={s.y - 20} anchor="middle" text={c.tag} mono />
                  </motion.g>
                );
              })}
          </AnimatePresence>
        </svg>
      </div>

      {/* ── ride status panel ── */}
      <aside
        className="relative mx-auto mt-4 flex max-w-xl flex-col rounded-2xl border border-white/10 bg-background/80 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl xl:absolute xl:bottom-6 xl:right-8 xl:top-6 xl:mt-0 xl:w-[360px] xl:p-6 xl:max-w-none"
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow flex items-center gap-2 text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Live ride
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">0{shown + 1} / 04</span>
        </div>

        <div className="mt-4 h-7 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={shown}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="truncate text-lg font-semibold tracking-tight"
            >
              {PHASES[shown].label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* timeline */}
        <ol className="mt-6 flex-1">
          {STEPS.map((s, i) => {
            const done = i < shown || (i === 3 && shown === 3);
            const active = i === shown && !done;
            return (
              <li key={s.title} className="relative flex gap-3 pb-6 last:pb-0">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="absolute bottom-0.5 left-[11px] top-7 w-px overflow-hidden bg-white/10">
                    {i < shown && <span className="block size-full bg-primary" />}
                    {i === shown && (
                      <motion.span
                        key={`${shown}-${inView}`}
                        className="block w-full bg-primary"
                        initial={{ height: reduce ? "55%" : "0%" }}
                        animate={{ height: reduce ? "55%" : "100%" }}
                        transition={{ duration: PHASES[i].ms / 1000, ease: "linear" }}
                      />
                    )}
                  </span>
                )}
                <span
                  className={cn(
                    "relative grid size-6 shrink-0 place-items-center rounded-full",
                    done && "bg-primary text-primary-foreground",
                    active && "border-2 border-primary",
                    !done && !active && "border border-white/15",
                  )}
                >
                  {done && <Check className="size-3.5" strokeWidth={3} />}
                  {active && <span className="size-2 rounded-full bg-primary" />}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className={cn("text-sm font-medium leading-tight transition-colors", !done && !active && "text-muted-foreground")}>{s.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* driver → receipt */}
        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <AnimatePresence mode="wait" initial={false}>
            {shown < 3 ? (
              <motion.div
                key="driver"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: shown === 0 ? 0.45 : 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-center gap-3 p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">JR</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    Jordan R.
                    <BadgeCheck className="size-3.5 text-primary" aria-label="Verified driver" />
                    <span className="flex items-center gap-0.5 font-mono text-[11px] font-normal text-muted-foreground">
                      <Star className="size-3 fill-primary text-primary" />4.97
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">Black Chevrolet Tahoe · 8KZM214</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex items-center gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Trip fare</p>
                  <p className="truncate text-xs text-muted-foreground">Tip goes 100% to your driver</p>
                </div>
                <p className="font-mono text-xl font-semibold tracking-tight">$38.40</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}

/** Rounded label that stays level in screen space. */
function MapLabel({ x, y, text, prefix, anchor, mono }: { x: number; y: number; text: string; prefix?: string; anchor: "start" | "middle" | "end"; mono?: boolean }) {
  const chars = (prefix ? prefix.length + 3 : 0) + text.length;
  const w = chars * (mono ? 5.6 : 5.2) + 16;
  const left = anchor === "start" ? x : anchor === "middle" ? x - w / 2 : x - w;
  return (
    <g>
      <rect x={left} y={y - 11} width={w} height={20} rx={6} className="fill-background/90 stroke-white/15" />
      <text
        x={left + w / 2} y={y + 2.5} textAnchor="middle" fontSize={9.5}
        className={cn("fill-foreground", mono ? "font-mono" : "font-medium")}
        letterSpacing={mono ? 0.4 : 0}
      >
        {prefix && <tspan className="fill-muted-foreground">{prefix} · </tspan>}
        {text}
      </text>
    </g>
  );
}

/** Top-down car silhouette centred on the origin, facing +x. */
function CarShape({ className }: { className?: string }) {
  return (
    <g transform="scale(1.35)" style={{ filter: "drop-shadow(0 2px 2px rgb(0 0 0 / 0.55))" }}>
      <rect x={-10} y={-5.5} width={20} height={11} rx={4} className={className} />
      <rect x={1.5} y={-4} width={4} height={8} rx={1.2} className="fill-background/70" />
      <rect x={-7} y={-4} width={3} height={8} rx={1} className="fill-background/40" />
    </g>
  );
}

function MatchedCar({ x, y, r, active }: { x: MotionValue<number>; y: MotionValue<number>; r: MotionValue<number>; active: boolean }) {
  return (
    <motion.g style={{ x, y }}>
      <motion.circle r={22} className="fill-primary/20" initial={false} animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }} />
      <motion.g style={{ rotate: r }}>
        <CarShape className={active ? "fill-primary" : "fill-white/75"} />
      </motion.g>
    </motion.g>
  );
}
