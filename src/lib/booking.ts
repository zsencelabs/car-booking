import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";
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

export const MAX_PASSENGERS = Math.max(...VEHICLE_CATEGORIES.map((c) => c.passengers));

const isTripType = (v: string | null): v is TripType => TRIP_TYPES.some((t) => t.value === v);
const isCategoryId = (v: string | null): v is VehicleCategoryId => VEHICLE_CATEGORIES.some((c) => c.id === v);

/** Reads a draft from the URL. Anything unknown or out of range falls back to a safe default. */
export function draftFromParams(p: Params): BookingDraft {
  const tripType = p.get("tripType");
  const categoryId = p.get("categoryId");
  const date = p.get("date") ?? "";
  const time = p.get("time") ?? "";
  const passengers = Math.trunc(Number(p.get("passengers") ?? 1));
  return {
    pickup: (p.get("pickup") ?? "").slice(0, 200),
    destination: (p.get("destination") ?? "").slice(0, 200),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: /^\d{2}:\d{2}$/.test(time) ? time : "12:00",
    tripType: isTripType(tripType) ? tripType : "scheduled",
    passengers: Number.isFinite(passengers) ? Math.min(Math.max(passengers, 1), MAX_PASSENGERS) : 1,
    categoryId: isCategoryId(categoryId) ? categoryId : undefined,
  };
}

/** Adapts Next's `searchParams` record to the `get()` shape `draftFromParams` expects. */
export function paramsFromRecord(r: Record<string, string | string[] | undefined>): Params {
  return { get: (name) => { const v = r[name]; return Array.isArray(v) ? (v[0] ?? null) : (v ?? null); } };
}
