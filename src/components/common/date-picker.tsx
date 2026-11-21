"use client";

import { useEffect, useRef, useState } from "react";
import { endOfMonth, format, isValid, parse, parseISO, setMonth as withMonth, setYear as withYear, startOfMonth, addMonths } from "date-fns";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type View = "year" | "month" | "day";

const MONTHS = Array.from({ length: 12 }, (_, i) => format(new Date(2024, i, 1), "MMM"));

const toDate = (value?: string) => {
  if (!value) return undefined;
  const d = parseISO(value);
  return isValid(d) ? d : undefined;
};

/** A stored `YYYY-MM-DD` value as readable text, such as "March 14, 1992". */
export function formatDateLabel(value?: string) {
  const d = toDate(value);
  return d ? format(d, "MMMM d, yyyy") : "";
}

const maskTyped = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length > 4) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
};

const gridButton = (selected: boolean) => cn(
  "h-11 rounded-xl text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30",
  selected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
);

const iconButton = "grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-30";
const headerButton = "inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

export function DatePicker({
  id, value, onChange, onBlur, ref, min, max, placeholder = "Select a date", startView = "day", rangeMessage = "That date isn't available", "aria-invalid": invalid,
}: {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: (el: HTMLButtonElement | null) => void;
  min: Date;
  max: Date;
  placeholder?: string;
  startView?: "year" | "day";
  rangeMessage?: string;
  "aria-invalid"?: boolean;
}) {
  const selected = toDate(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(startView);
  const [month, setMonth] = useState<Date>(() => startOfMonth(selected ?? max));
  const [typed, setTyped] = useState("");
  const [typedError, setTypedError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);

  const clampMonth = (d: Date) => {
    if (d > max) return startOfMonth(max);
    if (endOfMonth(d) < min) return startOfMonth(min);
    return startOfMonth(d);
  };

  const firstYear = min.getFullYear();
  const lastYear = max.getFullYear();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => (startView === "year" ? lastYear - i : firstYear + i));
  const canGoBack = startOfMonth(month) > startOfMonth(min);
  const canGoForward = startOfMonth(month) < startOfMonth(max);

  // Keep keyboard focus in the picker as it moves between steps, and show the chosen year.
  useEffect(() => {
    if (!open) return;
    bodyRef.current?.focus({ preventScroll: true });
    const list = yearsRef.current;
    const current = list?.querySelector<HTMLElement>("[data-current=true]");
    if (list && current) list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2;
  }, [open, view]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setMonth(clampMonth(selected ?? max));
      setView(selected ? "day" : startView);
      setTyped("");
      setTypedError("");
    } else {
      onBlur?.();
    }
  }

  function commit(d: Date) {
    onChange(format(d, "yyyy-MM-dd"));
    handleOpenChange(false);
  }

  function pickYear(y: number) {
    setMonth(clampMonth(withYear(month, y)));
    setView("month");
  }

  function pickMonth(i: number) {
    setMonth(clampMonth(withMonth(month, i)));
    setView("day");
  }

  function handleTyped(raw: string) {
    const next = maskTyped(raw);
    setTyped(next);
    setTypedError("");
    if (next.length < 10) return;
    const d = parse(next, "MM/dd/yyyy", new Date());
    if (!isValid(d)) setTypedError("Enter a real date as MM/DD/YYYY");
    else if (d < new Date(min.getFullYear(), min.getMonth(), min.getDate()) || d > max) setTypedError(rangeMessage);
    else commit(d);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        ref={ref}
        aria-invalid={invalid}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); handleOpenChange(true); } }}
        className={cn(
          "flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-input bg-transparent px-4 text-left text-base outline-none transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50 md:text-sm dark:bg-input/30",
          invalid && "border-destructive ring-3 ring-destructive/20 hover:border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 dark:border-destructive/50 dark:ring-destructive/40",
        )}
      >
        <CalendarDays aria-hidden className="size-[18px] shrink-0 text-muted-foreground" />
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>
          {selected ? format(selected, "MMMM d, yyyy") : placeholder}
        </span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={8} initialFocus={bodyRef} className="max-h-(--available-height) w-[min(20rem,calc(100vw-2rem))] gap-3 overflow-y-auto rounded-2xl p-3">
        <div ref={bodyRef} tabIndex={-1} className="outline-none">
          <div className="mb-3 flex items-center justify-between gap-1">
            <button type="button" aria-label="Previous month" disabled={!canGoBack} onClick={() => setMonth(addMonths(month, -1))} className={cn(iconButton, view !== "day" && "invisible")}>
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex items-center">
              {view === "year" ? (
                <span className="px-3 text-sm font-semibold">Select year</span>
              ) : (
                <>
                  <button type="button" aria-label={`Change month, ${format(month, "MMMM")}`} onClick={() => setView("month")} className={cn(headerButton, view === "month" && "bg-muted")}>
                    {format(month, "MMMM")}
                  </button>
                  <button type="button" aria-label={`Change year, ${format(month, "yyyy")}`} onClick={() => setView("year")} className={headerButton}>
                    {format(month, "yyyy")}
                    <ChevronDown aria-hidden className="size-3.5 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
            <button type="button" aria-label="Next month" disabled={!canGoForward} onClick={() => setMonth(addMonths(month, 1))} className={cn(iconButton, view !== "day" && "invisible")}>
              <ChevronRight className="size-4" />
            </button>
          </div>

          {view === "year" && (
            <div ref={yearsRef} role="group" aria-label="Year" className="relative grid h-56 grid-cols-4 content-start gap-1 overflow-y-auto overscroll-contain pr-1">
              {years.map((y) => {
                const current = selected?.getFullYear() === y;
                return (
                  <button key={y} type="button" data-current={current} aria-pressed={current} onClick={() => pickYear(y)} className={cn(gridButton(current), "tabular-nums")}>
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {view === "month" && (
            <div role="group" aria-label="Month" className="grid h-56 grid-cols-3 content-center gap-1.5">
              {MONTHS.map((label, i) => {
                const candidate = new Date(month.getFullYear(), i, 1);
                const unavailable = candidate > max || endOfMonth(candidate) < min;
                const current = !!selected && selected.getFullYear() === month.getFullYear() && selected.getMonth() === i;
                return (
                  <button key={label} type="button" disabled={unavailable} aria-pressed={current} onClick={() => pickMonth(i)} className={cn(gridButton(current), "h-12")}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {view === "day" && (
            <div className="min-h-56">
              <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selected}
                onSelect={(d) => { if (d) commit(d); }}
                disabled={[{ before: min }, { after: max }]}
                startMonth={min}
                endMonth={max}
                hideNavigation
                showOutsideDays={false}
                className="w-full bg-transparent p-0 [--cell-radius:var(--radius-lg)] [--cell-size:--spacing(8)] [&_button[data-day]]:aspect-auto [&_button[data-day]]:h-8"
                classNames={{ root: "w-full", month_caption: "hidden", week: "mt-0.5 flex w-full", day: "group/day relative h-8 w-full p-0 text-center select-none" }}
              />
            </div>
          )}

          <div className="mt-2.5 border-t pt-2.5">
            <input
              id={`${id}-typed`}
              inputMode="numeric"
              autoComplete="off"
              value={typed}
              onChange={(e) => handleTyped(e.target.value)}
              aria-label="Or type the date as MM/DD/YYYY"
              placeholder="Or type MM/DD/YYYY"
              aria-invalid={!!typedError}
              className={cn("h-9 w-full rounded-xl bg-muted/60 px-3 text-sm tabular-nums outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50", typedError && "ring-2 ring-destructive/40")}
            />
            {typedError && <p role="alert" className="mt-1.5 text-xs text-destructive">{typedError}</p>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
