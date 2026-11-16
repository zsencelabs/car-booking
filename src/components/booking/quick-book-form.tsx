"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRight, ArrowRight, ArrowUpDown, CalendarDays, Clock, Minus, Plus, Search, Users } from "lucide-react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { draftFromParams, draftToParams, TRIP_TYPES } from "@/lib/booking";
import type { BookingDraft, TripType } from "@/types";

const MAX_PASSENGERS = 8;

const schema = z.object({
  pickup: z.string().trim().min(3, "Enter a pickup address"),
  destination: z.string().trim().min(3, "Enter a destination"),
  tripType: z.string(),
  date: z.string(),
  time: z.string(),
  passengers: z.number().int().min(1, "At least 1 passenger").max(MAX_PASSENGERS, `Up to ${MAX_PASSENGERS} passengers`),
}).superRefine((v, ctx) => {
  if (v.tripType === "immediate") return;
  if (!v.date) ctx.addIssue({ code: "custom", path: ["date"], message: "Choose a date" });
  if (!v.time) ctx.addIssue({ code: "custom", path: ["time"], message: "Choose a time" });
});

export function QuickBookForm({
  initial, submitLabel = "See vehicles and prices", className, layout = "card",
}: { initial?: BookingDraft; submitLabel?: string; className?: string; layout?: "card" | "bar" }) {
  const router = useRouter();
  const [draft, setDraft] = useState<BookingDraft>(initial ?? draftFromParams(new URLSearchParams()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [swaps, setSwaps] = useState(0);
  const set = <K extends keyof BookingDraft>(k: K, v: BookingDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const scheduled = draft.tripType !== "immediate";
  const locationError = errors.pickup ?? errors.destination;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = schema.safeParse(draft);
    if (!res.success) {
      setErrors(Object.fromEntries(res.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    router.push(`/book/vehicles?${draftToParams(draft).toString()}`);
  }

  function swap() {
    setDraft((d) => ({ ...d, pickup: d.destination, destination: d.pickup }));
    setSwaps((n) => n + 1);
  }

  function pickTripType(v: TripType) {
    set("tripType", v);
    if (v !== "immediate" && !draft.date) set("date", new Date().toISOString().slice(0, 10));
  }

  if (layout === "bar") {
    const firstError = errors.pickup ?? errors.destination ?? errors.date ?? errors.time;
    return (
      <form onSubmit={onSubmit} noValidate className={cn("w-full", className)}>
        {/* trip type */}
        <div role="tablist" aria-label="Trip type" className="mx-auto mb-4 flex w-fit gap-1 rounded-full border bg-card/60 p-1.5 backdrop-blur">
          {TRIP_TYPES.map((t) => {
            const selected = draft.tripType === t.value;
            return (
              <button
                key={t.value} type="button" role="tab" aria-selected={selected}
                onClick={() => pickTripType(t.value as TripType)}
                className={cn("relative h-10 rounded-full px-3 text-[13px] font-medium transition-colors sm:h-11 sm:px-5 sm:text-sm",
                  selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {selected && (
                  <motion.span layoutId="trip-pill-bar" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                )}
                <span className="relative whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* the bar */}
        <div className="flex flex-col rounded-3xl border bg-card p-1.5 text-left shadow-2xl shadow-black/40 md:h-[72px] md:flex-row md:items-stretch md:rounded-[26px]">
          <BarSegment id="pickup-bar" label="Pickup" invalid={!!errors.pickup} marker={<span className="size-2.5 rounded-full border-2 border-foreground" />} className="md:flex-[1.1]">
            <input
              id="pickup-bar" value={draft.pickup} onChange={(e) => set("pickup", e.target.value)}
              placeholder="Pickup location" autoComplete="street-address" aria-invalid={!!errors.pickup}
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </BarSegment>

          {/* swap, sitting on the divider */}
          <div className="relative z-10 h-px bg-border mx-4 md:mx-0 md:my-3 md:h-auto md:w-px">
            <motion.button
              type="button" onClick={swap} aria-label="Swap pickup and destination"
              animate={{ rotate: swaps * 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute right-2 top-0 -mt-4 grid size-8 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground md:left-0 md:right-auto md:top-1/2 md:-ml-4"
            >
              <ArrowUpDown className="size-3.5 md:hidden" />
              <ArrowLeftRight className="hidden size-3.5 md:block" />
            </motion.button>
          </div>

          <BarSegment id="destination-bar" label="Drop-off" invalid={!!errors.destination} marker={<span className="size-2.5 rounded-[3px] bg-foreground" />} className="md:flex-[1.1]">
            <input
              id="destination-bar" value={draft.destination} onChange={(e) => set("destination", e.target.value)}
              placeholder="Where to?" aria-invalid={!!errors.destination}
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
          </BarSegment>

          <AnimatePresence initial={false}>
            {scheduled && (
              <motion.div
                key="when"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col overflow-hidden md:flex-row"
              >
                <span aria-hidden className="mx-4 h-px bg-border md:mx-0 md:my-3 md:h-auto md:w-px" />
                <BarSegment id="date-bar" label="Date" invalid={!!errors.date} marker={<CalendarDays className="size-4 text-muted-foreground" />} className="md:w-[11.5rem]">
                  <input id="date-bar" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className="w-full bg-transparent text-[15px] outline-none [color-scheme:dark]" />
                </BarSegment>
                <span aria-hidden className="mx-4 h-px bg-border md:mx-0 md:my-3 md:h-auto md:w-px" />
                <BarSegment id="time-bar" label="Time" invalid={!!errors.time} marker={<Clock className="size-4 text-muted-foreground" />} className="md:w-[10.75rem]">
                  <input id="time-bar" type="time" value={draft.time} onChange={(e) => set("time", e.target.value)} className="w-full bg-transparent text-[15px] outline-none [color-scheme:dark]" />
                </BarSegment>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="group mt-1.5 flex h-14 shrink-0 items-center justify-center gap-2 rounded-[20px] bg-primary px-7 text-[15px] font-semibold text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] md:mt-0 md:h-auto"
          >
            <Search className="size-4" />
            {submitLabel}
            <ArrowRight className="size-4 -ml-1 w-0 opacity-0 transition-all group-hover:ml-0 group-hover:w-4 group-hover:opacity-100" />
          </button>
        </div>

        <div className="mt-3 h-5 text-center text-xs">
          {firstError ? (
            <p role="alert" className="text-destructive">{firstError}</p>
          ) : (
            <p className="text-muted-foreground">No charge until your ride is complete.</p>
          )}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn("space-y-3 rounded-2xl border bg-card p-5 shadow-sm", className)}>
      {/* trip type */}
      <div role="tablist" aria-label="Trip type" className="grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
        {TRIP_TYPES.map((t) => {
          const selected = draft.tripType === t.value;
          return (
            <button
              key={t.value} type="button" role="tab" aria-selected={selected}
              onClick={() => {
                set("tripType", t.value as TripType);
                if (t.value !== "immediate" && !draft.date) set("date", new Date().toISOString().slice(0, 10));
              }}
              className={cn("relative rounded-lg px-1 py-1.5 text-[13px] font-medium transition-colors sm:px-2 sm:text-sm",
                selected ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {selected && (
                <motion.span layoutId="trip-pill" className="absolute inset-0 rounded-lg bg-background shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
              )}
              <span className="relative whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* pickup → destination */}
      <div>
        <div
          className={cn(
            "relative rounded-xl border bg-muted/40 transition-colors focus-within:border-ring focus-within:bg-muted/60",
            locationError && "border-destructive/60",
          )}
        >
          {/* rail */}
          <span aria-hidden className="pointer-events-none absolute left-[18px] top-[23px] size-2.5 rounded-full border-2 border-foreground" />
          <span aria-hidden className="pointer-events-none absolute left-[22px] top-[35px] h-[32px] w-px bg-foreground/30" />
          <span aria-hidden className="pointer-events-none absolute left-[18px] top-[70px] size-2.5 rounded-[3px] bg-foreground" />

          <label htmlFor="pickup" className="sr-only">Pickup</label>
          <input
            id="pickup" value={draft.pickup} onChange={(e) => set("pickup", e.target.value)}
            placeholder="Pickup location" autoComplete="street-address" aria-invalid={!!errors.pickup}
            className="h-14 w-full rounded-t-xl bg-transparent pl-11 pr-14 text-[15px] outline-none placeholder:text-muted-foreground"
          />
          <div className="ml-11 mr-14 border-t" />
          <label htmlFor="destination" className="sr-only">Destination</label>
          <input
            id="destination" value={draft.destination} onChange={(e) => set("destination", e.target.value)}
            placeholder="Where to?" aria-invalid={!!errors.destination}
            className="h-14 w-full rounded-b-xl bg-transparent pl-11 pr-14 text-[15px] outline-none placeholder:text-muted-foreground"
          />

          <motion.button
            type="button" onClick={swap} aria-label="Swap pickup and destination"
            animate={{ rotate: swaps * 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute right-3 top-1/2 -mt-[18px] grid size-9 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ArrowUpDown className="size-4" />
          </motion.button>
        </div>
        {locationError && <p role="alert" className="mt-1.5 text-xs text-destructive">{locationError}</p>}
      </div>

      {/* schedule */}
      <AnimatePresence initial={false}>
        {scheduled && (
          <motion.div
            key="schedule"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              <Field id="date" label="Date" icon={<CalendarDays className="size-4" />} error={errors.date}>
                <Input id="date" type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className="h-11 rounded-xl pl-9" />
              </Field>
              <Field id="time" label="Time" icon={<Clock className="size-4" />} error={errors.time}>
                <Input id="time" type="time" value={draft.time} onChange={(e) => set("time", e.target.value)} className="h-11 rounded-xl pl-9" />
              </Field>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* passengers */}
      <div className="flex h-12 items-center justify-between rounded-xl border px-3">
        <span id="passengers-label" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" /> Passengers
        </span>
        <div className="flex items-center gap-1" role="group" aria-labelledby="passengers-label">
          <StepButton label="Remove passenger" disabled={draft.passengers <= 1} onClick={() => set("passengers", Math.max(1, draft.passengers - 1))}>
            <Minus className="size-3.5" />
          </StepButton>
          <span className="w-7 text-center font-mono text-sm tabular-nums" aria-live="polite">{draft.passengers}</span>
          <StepButton label="Add passenger" disabled={draft.passengers >= MAX_PASSENGERS} onClick={() => set("passengers", Math.min(MAX_PASSENGERS, draft.passengers + 1))}>
            <Plus className="size-3.5" />
          </StepButton>
        </div>
      </div>
      {errors.passengers && <p role="alert" className="text-xs text-destructive">{errors.passengers}</p>}

      <button
        type="submit"
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.99]"
      >
        {submitLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-center text-xs text-muted-foreground">No charge until your ride is complete.</p>
    </form>
  );
}

function BarSegment({ id, label, marker, invalid, className, children }: {
  id: string; label: string; marker: React.ReactNode; invalid?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-[20px] px-4 py-3 transition-colors hover:bg-muted/50 focus-within:bg-muted md:py-0",
        invalid && "bg-destructive/10 hover:bg-destructive/10",
        className,
      )}
    >
      <span aria-hidden className="grid size-4 shrink-0 place-items-center">{marker}</span>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
        {children}
      </div>
    </div>
  );
}

function StepButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-label={label} disabled={disabled} onClick={onClick}
      className="grid size-8 place-items-center rounded-full border bg-background text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Field({ id, label, icon, error, children }: { id: string; label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
