"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, SearchX, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { WorkspaceData } from "@/lib/mock/dashboards";
import { cn } from "@/lib/utils";
import { FilterPanel, type Filters } from "./filter-panel";
import { WorkCard } from "./work-card";

type SortId = "closest" | "low" | "high" | "rating";

export function WorkspaceView({ workspace }: { workspace: WorkspaceData }) {
  const { items, filters: groups, noun, priceLabel, favourites, closestLabel } = workspace;
  const bounds = useMemo<[number, number]>(() => {
    const prices = items.map((i) => i.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [items]);
  const initial: Filters = { selected: {}, range: bounds, favouritesOnly: false };

  const [filters, setFilters] = useState<Filters>(initial);
  const [sort, setSort] = useState<SortId>("closest");
  const [sortOpen, setSortOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);

  const hasRatings = items.some((i) => i.rating !== undefined);
  const sorts: { id: SortId; label: string }[] = [
    { id: "closest", label: closestLabel },
    { id: "low", label: "Lowest price" },
    { id: "high", label: "Highest price" },
    ...(hasRatings ? [{ id: "rating" as const, label: "Top rated" }] : []),
  ];
  // Fleet and queue views rank their default sort by value rather than distance.
  const defaultDescending = closestLabel !== "Closest to me" && closestLabel !== "Shortest trip";

  const visible = useMemo(() => {
    const result = items.filter((item) => {
      if (item.price < filters.range[0] || item.price > filters.range[1]) return false;
      if (filters.favouritesOnly && !saved.includes(item.id)) return false;
      return groups.every((g) => {
        const chosen = filters.selected[g.key] ?? [];
        return chosen.length === 0 || chosen.includes(item.facets[g.key]);
      });
    });
    return result.sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      return defaultDescending ? b.distance - a.distance : a.distance - b.distance;
    });
  }, [items, groups, filters, saved, sort, defaultDescending]);

  const activeCount = Object.values(filters.selected).reduce((n, v) => n + v.length, 0)
    + (filters.range[0] !== bounds[0] || filters.range[1] !== bounds[1] ? 1 : 0)
    + (filters.favouritesOnly ? 1 : 0);
  const reset = () => setFilters(initial);

  const panel = (
    <FilterPanel
      groups={groups} items={items} priceLabel={priceLabel} bounds={bounds} filters={filters}
      showFavourites={favourites} onChange={setFilters} onReset={reset} dirty={activeCount > 0}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      <aside aria-label="Filters" className="hidden w-72 shrink-0 overflow-y-auto border-r bg-background xl:block">{panel}</aside>

      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            <motion.span key={visible.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="inline-block tabular-nums">{visible.length}</motion.span>{" "}
            {noun}
          </h1>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger render={<Button variant="outline" className="h-9 rounded-full px-3.5 text-[13px] xl:hidden" />}>
                <SlidersHorizontal aria-hidden className="size-3.5" />
                Filters{activeCount > 0 && <span className="grid size-4.5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{activeCount}</span>}
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(21rem,calc(100vw-2rem))] gap-0 overflow-y-auto p-0">
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <div className="pt-8">{panel}</div>
              </SheetContent>
            </Sheet>
            <Popover open={sortOpen} onOpenChange={setSortOpen}>
              <PopoverTrigger aria-label={`Sort by ${sorts.find((s) => s.id === sort)?.label}`} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50">
                {sorts.find((s) => s.id === sort)?.label}
                <ChevronDown aria-hidden className={cn("size-3.5 text-muted-foreground transition-transform", sortOpen && "rotate-180")} />
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={6} className="w-48 gap-0.5 rounded-xl p-1.5">
                {sorts.map((s) => (
                  <button key={s.id} type="button" onClick={() => { setSort(s.id); setSortOpen(false); }} className="flex h-9 items-center justify-between rounded-lg px-2.5 text-left text-[13px] outline-none hover:bg-muted focus-visible:bg-muted">
                    {s.label}
                    {sort === s.id && <Check aria-hidden className="size-3.5 text-brand-ink" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3 min-[1120px]:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((item, i) => (
                <WorkCard
                  key={item.id} item={item} index={i}
                  favourite={favourites ? saved.includes(item.id) : undefined}
                  onFavourite={favourites ? () => setSaved((s) => (s.includes(item.id) ? s.filter((v) => v !== item.id) : [...s, item.id])) : undefined}
                  done={done.includes(item.id)}
                  onAction={() => setDone((d) => [...d, item.id])}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid place-items-center rounded-2xl bg-card px-6 py-20 text-center ring-1 ring-foreground/5">
            <SearchX aria-hidden className="mb-3 size-7 text-muted-foreground" />
            <p className="font-semibold">Nothing matches these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Try widening the range or clearing a filter.</p>
            <Button onClick={reset} className="mt-5 rounded-full px-5">Reset filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
