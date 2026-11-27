import type { BookingDraft, TripType } from "@/types";
import { airportAddress, airportByCode } from "@/lib/airports";

/** How the ride form offers timing and direction. "one-way" is kept for older links and means a scheduled one-way ride. */
export const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: "immediate", label: "Ride now" },
  { value: "scheduled", label: "Schedule" },
  { value: "round-trip", label: "Round trip" },
];

/** The API's timing and direction for a trip type. */
export function apiTrip(tripType: TripType) {
  return {
    timing: tripType === "immediate" ? ("IMMEDIATE" as const) : ("SCHEDULED" as const),
    tripType: tripType === "round-trip" ? ("ROUND_TRIP" as const) : ("ONE_WAY" as const),
  };
}

export const tripLabel = (tripType: TripType) =>
  tripType === "immediate" ? "Ride now" : tripType === "round-trip" ? "Round trip" : "Scheduled";

/** Pickup address and coordinates aren't written: they come from `pickupCode`. */
const DERIVED = new Set(["pickup", "pickupLat", "pickupLng"]);

export function draftToParams(d: Partial<BookingDraft>) {
  const p = new URLSearchParams();
  Object.entries(d).forEach(([k, v]) => {
    if (DERIVED.has(k)) return;
    if (v !== undefined && v !== "") p.set(k, String(v));
  });
  return p;
}

type Params = { get(name: string): string | null };

/** The largest vehicle class seats 8. */
export const MAX_PASSENGERS = 8;

const TRIP_VALUES: TripType[] = ["immediate", "scheduled", "one-way", "round-trip"];
const isTripType = (v: string | null): v is TripType => TRIP_VALUES.includes(v as TripType);
const isCategoryId = (v: string | null): v is string => !!v && /^[a-z][a-z0-9-]{1,31}$/.test(v);

const isIso = (v: string | null) => !!v && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(v) && !Number.isNaN(Date.parse(v));

function coord(raw: string | null, limit: number) {
  if (raw === null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : undefined;
}

/** Reads a draft from the URL. Anything unknown or out of range falls back to a safe default. */
export function draftFromParams(p: Params): BookingDraft {
  const tripType = p.get("tripType");
  const categoryId = p.get("categoryId");
  const date = p.get("date") ?? "";
  const time = p.get("time") ?? "";
  const passengers = Math.trunc(Number(p.get("passengers") ?? 1));
  // Pickups are airports only, so a pickup typed into the URL is ignored.
  const airport = airportByCode(p.get("pickupCode"));
  return {
    pickupCode: airport?.code,
    pickup: airport ? airportAddress(airport) : "",
    pickupLat: airport?.lat,
    pickupLng: airport?.lng,
    destination: (p.get("destination") ?? "").slice(0, 300),
    destinationLat: coord(p.get("destinationLat"), 90),
    destinationLng: coord(p.get("destinationLng"), 180),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: /^\d{2}:\d{2}$/.test(time) ? time : "12:00",
    at: isIso(p.get("at")) ? p.get("at")! : undefined,
    tripType: isTripType(tripType) ? (tripType === "one-way" ? "scheduled" : tripType) : "immediate",
    passengers: Number.isFinite(passengers) ? Math.min(Math.max(passengers, 1), MAX_PASSENGERS) : 1,
    categoryId: isCategoryId(categoryId) ? categoryId : undefined,
  };
}

/** Whether a draft has both places with coordinates, so it can be priced. */
export function hasRoute(d: BookingDraft): d is BookingDraft & { pickupLat: number; pickupLng: number; destinationLat: number; destinationLng: number } {
  return d.pickupLat !== undefined && d.pickupLng !== undefined && d.destinationLat !== undefined && d.destinationLng !== undefined && !!d.pickup && !!d.destination;
}

/** Adapts Next's `searchParams` record to the `get()` shape `draftFromParams` expects. */
export function paramsFromRecord(r: Record<string, string | string[] | undefined>): Params {
  return { get: (name) => { const v = r[name]; return Array.isArray(v) ? (v[0] ?? null) : (v ?? null); } };
}
