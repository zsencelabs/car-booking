"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE, MaskLines } from "./reveal";

type Testimonial = { name: string; role: string; text: string };

const SLIDE_MS = 4200;
const VISIBLE = 4;

const initials = (name: string) =>
  name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const pad = (n: number) => String(n).padStart(2, "0");

export function Testimonials({ items }: { items: readonly Testimonial[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState(0);
  // Paused by the button (stays paused), or while the pointer or focus is inside.
  const [paused, setPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const n = items.length;
  const playing = inView && !reduce && !paused && !holding;

  // One timer per slide; only while playing. A click restarts it from that slide.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % n), SLIDE_MS);
    return () => clearTimeout(t);
  }, [active, playing, n]);

  const current = items[active];
  const words = current.text.split(" ");
  // Endless window: the active author first, then the next ones, wrapping around.
  const track = Array.from({ length: Math.min(VISIBLE, n) }, (_, k) => (active + k) % n);

  return (
    <section className="border-t bg-background py-24 md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">06 — In their words</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Riders, drivers", <span key="b" className="text-muted-foreground">and fleets agree.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Every side of the marketplace runs on the same rules: verified people, clear pricing and pay that shows up where it should.
          </p>
        </div>

        <div
          ref={ref}
          onPointerEnter={() => setHolding(true)}
          onPointerLeave={() => setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setHolding(false); }}
        >
          {/* featured quote */}
          <figure className="relative min-h-[240px] md:min-h-[260px]">
            <div className="flex items-start justify-between">
              <span aria-hidden className="block font-serif text-7xl leading-none text-primary md:text-8xl">&ldquo;</span>
              <span className="flex items-center gap-3 pt-4 font-mono text-[11px] text-muted-foreground">
                {pad(active + 1)} / {pad(n)}
                {!reduce && (
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    aria-label={paused ? "Play testimonials" : "Pause testimonials"}
                    className="grid size-7 place-items-center rounded-full border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {paused ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
                  </button>
                )}
              </span>
            </div>
            <div aria-live={playing ? "off" : "polite"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.blockquote
                  key={active}
                  exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                  transition={{ duration: 0.25 }}
                  className="-mt-6 max-w-4xl text-2xl font-medium leading-snug tracking-tight md:-mt-8 md:text-4xl"
                >
                  {words.map((w, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.02, ease: EASE }}
                    >
                      {w}
                      {i < words.length - 1 && " "}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </figure>

          {/* endless author track */}
          <div className="mt-10 grid grid-cols-2 overflow-hidden border-t md:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {track.map((idx, k) => {
                const t = items[idx];
                const on = k === 0;
                return (
                  <motion.button
                    key={t.name}
                    layout={!reduce}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-pressed={on}
                    aria-label={`${t.name}, ${t.role}`}
                    className={cn(
                      "group relative flex items-center gap-3 pr-3 pt-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      k >= 2 && "hidden md:flex",
                    )}
                  >
                    <span aria-hidden className="absolute inset-x-0 -top-px h-px overflow-hidden">
                      {on && (
                        <motion.span
                          key={`${active}-${playing}`}
                          className="block h-full bg-primary"
                          initial={{ width: reduce ? "100%" : "0%" }}
                          animate={{ width: reduce || playing ? "100%" : "0%" }}
                          transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                        />
                      )}
                    </span>
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors duration-300",
                        on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {initials(t.name)}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block truncate text-sm font-medium transition-colors duration-300", !on && "text-muted-foreground group-hover:text-foreground")}>
                        {t.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{t.role}</span>
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
