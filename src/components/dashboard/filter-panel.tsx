"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { EASE } from "@/components/landing/reveal";
import type { FilterGroup, WorkItem } from "@/lib/dashboards/types";
import { cn } from "@/lib/utils";
import { PriceHistogram } from "./price-histogram";

export type Filters = { selected: Record<string, string[]>; range: [number, number]; favouritesOnly: boolean };

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t py-3.5">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between rounded-md py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <span className="eyebrow text-[11px]">{label}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden">
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FilterPanel({ groups, items, priceLabel, bounds, filters, showFavourites, onChange, onReset, dirty }: {
  groups: FilterGroup[];
  items: WorkItem[];
  priceLabel: string;
  bounds: [number, number];
  filters: Filters;
  showFavourites?: boolean;
  onChange: (next: Filters) => void;
  onReset: () => void;
  dirty: boolean;
}) {
  const uid = useId();

  const setValues = (key: string, values: string[]) => onChange({ ...filters, selected: { ...filters.selected, [key]: values } });
  const toggle = (key: string, option: string) => {
    const current = filters.selected[key] ?? [];
    setValues(key, current.includes(option) ? current.filter((v) => v !== option) : [...current, option]);
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold tracking-tight">Filter by</h2>
        <button type="button" onClick={onReset} disabled={!dirty} className="inline-flex items-center gap-1 rounded-md text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-40">
          Reset all <X aria-hidden className="size-3" />
        </button>
      </div>

      {showFavourites && (
        <label className="flex cursor-pointer items-center justify-between border-t py-3.5">
          <span className="eyebrow text-[11px]">Favourites only</span>
          <span className="relative">
            <input type="checkbox" role="switch" checked={filters.favouritesOnly} onChange={(e) => onChange({ ...filters, favouritesOnly: e.target.checked })} className="peer sr-only" />
            <span className={cn("flex h-6 w-10 items-center rounded-full p-0.5 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50", filters.favouritesOnly ? "justify-end bg-primary" : "justify-start bg-muted")}>
              <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 34 }} className="size-5 rounded-full bg-background shadow-sm" />
            </span>
          </span>
        </label>
      )}

      <Group label={priceLabel}>
        <PriceHistogram label={priceLabel} prices={items.map((i) => i.price)} bounds={bounds} value={filters.range} onChange={(range) => onChange({ ...filters, range })} />
      </Group>

      {groups.map((group) => {
        const options = [...new Set(items.map((i) => i.facets[group.key]))];
        const current = filters.selected[group.key] ?? [];
        return (
          <Group key={group.key} label={group.label}>
            {group.kind === "checks" ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                {options.map((o) => {
                  const id = `${uid}-${group.key}-${o}`;
                  return (
                    <label key={o} htmlFor={id} className="flex min-w-0 cursor-pointer items-center gap-2 text-sm">
                      <Checkbox id={id} checked={current.includes(o)} onCheckedChange={() => toggle(group.key, o)} />
                      <span className="truncate">{o}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div role="radiogroup" aria-label={group.label} className="flex flex-wrap gap-1.5">
                {["Any", ...options].map((o) => {
                  const on = o === "Any" ? current.length === 0 : current[0] === o;
                  return (
                    <button
                      key={o} type="button" role="radio" aria-checked={on}
                      onClick={() => setValues(group.key, o === "Any" ? [] : [o])}
                      className={cn("relative h-8 rounded-full px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50", on ? "text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:text-foreground")}
                    >
                      {on && <motion.span layoutId={`${uid}-${group.key}`} className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                      <span className="relative">{o}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </Group>
        );
      })}
    </div>
  );
}
