import type { BookingDraft, TripType, VehicleCategoryId } from "@/types";

export const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: "scheduled", label: "Schedule" },
  { value: "immediate", label: "Ride now" },
  { value: "one-way", label: "One-way" },
  { value: "round-trip", label: "Round-trip" },
];

export function draftToParams(d: Partial<BookingDraft>) {
  const p = new URLSearchParams();
  Object.entries(d).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, String(v));
  });
  return p;
}

type Params = { get(name: string): string | null };

export function draftFromParams(p: Params): BookingDraft {
  const tripType = (p.get("tripType") as TripType) || "scheduled";
  return {
    pickup: p.get("pickup") ?? "",
    destination: p.get("destination") ?? "",
    date: p.get("date") ?? "",
    time: p.get("time") ?? "12:00",
    tripType,
    passengers: Number(p.get("passengers") ?? 1) || 1,
    categoryId: (p.get("categoryId") as VehicleCategoryId) || undefined,
  };
}

/** Adapts Next's `searchParams` record to the `get()` shape `draftFromParams` expects. */
export function paramsFromRecord(r: Record<string, string | string[] | undefined>): Params {
  return { get: (name) => { const v = r[name]; return Array.isArray(v) ? (v[0] ?? null) : (v ?? null); } };
}
