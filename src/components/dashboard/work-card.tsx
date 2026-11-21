"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Heart, Navigation, Star } from "lucide-react";
import { EASE } from "@/components/landing/reveal";
import type { WorkItem } from "@/lib/mock/dashboards";
import { usd } from "@/lib/mock/fare";
import { cn } from "@/lib/utils";
import { StatusPill } from "./panel-view";
import { VehicleArt } from "./vehicle-art";

type Props = {
  item: WorkItem;
  index: number;
  favourite?: boolean;
  onFavourite?: () => void;
  done?: boolean;
  onAction?: () => void;
};

export const WorkCard = forwardRef<HTMLElement, Props>(function WorkCard({ item, index, favourite, onFavourite, done, onAction }, ref) {
  const reduce = !!useReducedMotion();
  const whole = item.price >= 500;

  return (
    <motion.article
      ref={ref}
      layout={!reduce}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, delay: Math.min(index, 9) * 0.03, ease: EASE } }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.16 } }}
      whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.2, ease: EASE } }}
      transition={{ layout: { duration: 0.34, ease: EASE } }}
      className="group/card relative flex min-w-0 flex-col rounded-2xl bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-foreground/5 transition-shadow duration-300 hover:shadow-[0_18px_40px_-20px_rgb(0_0_0/0.35)]"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-3">
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><Navigation aria-hidden className="size-3 shrink-0" />{item.meta}</span>
          {item.rating !== undefined && (
            <span className="inline-flex shrink-0 items-center gap-1">
              <Star aria-hidden className="size-3 fill-primary text-brand-ink" />
              <span className="font-medium text-foreground">{item.rating.toFixed(1)}</span>
              {item.reviews !== undefined && <span>({item.reviews})</span>}
            </span>
          )}
        </span>
        {onFavourite ? (
          <motion.button
            type="button" aria-label={`${favourite ? "Remove" : "Add"} ${item.title} ${favourite ? "from" : "to"} favourites`} aria-pressed={favourite}
            onClick={onFavourite} whileTap={{ scale: 0.75 }}
            className="relative z-10 -m-1 grid size-8 shrink-0 place-items-center rounded-full outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <motion.span key={String(favourite)} initial={favourite && !reduce ? { scale: 0.4 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 13 }} className="grid">
              <Heart aria-hidden className={cn("size-4", favourite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
            </motion.span>
          </motion.button>
        ) : item.status && <StatusPill label={done ? (item.action?.done ?? item.status) : item.status} />}
      </div>

      <div className="relative my-2 flex flex-1 items-center overflow-hidden">
        <div aria-hidden className="absolute inset-x-6 bottom-1 top-6 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--foreground)_7%,transparent),transparent)]" />
        <VehicleArt vehicle={item.vehicle} tint={item.tint} className="relative mx-auto block h-auto w-full max-w-[17rem] transition-transform duration-500 ease-out group-hover/card:-translate-x-1 group-hover/card:scale-[1.03]" />
      </div>

      <div className="mt-auto flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight">
            {item.href
              ? <Link href={item.href} className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring/60">{item.title}</Link>
              : item.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="text-[15px] font-semibold tabular-nums">{whole ? `$${item.price.toLocaleString("en-US")}` : usd(item.price)}</span>
          <span className="ml-1 text-[11px] text-muted-foreground">{item.unit}</span>
        </p>
      </div>

      {item.href && (
        <span aria-hidden className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full bg-muted/70 text-[13px] font-medium transition-colors duration-200 group-hover/card:bg-primary group-hover/card:text-primary-foreground">
          Book this class <ArrowRight className="size-3.5 transition-transform group-hover/card:translate-x-0.5" />
        </span>
      )}
      {item.action && (
        <button
          type="button" disabled={done} onClick={onAction}
          aria-label={done ? `${item.title}: ${item.action.done}` : `${item.action.label} ${item.title}`}
          className={cn("mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50", done ? "bg-primary/20 text-brand-ink" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground")}
        >
          {done && <Check aria-hidden className="size-3.5" />}
          {done ? item.action.done : item.action.label}
        </button>
      )}
    </motion.article>
  );
});
