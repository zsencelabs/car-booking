import type { VehicleCategory } from "@/types";

/**
 * DISPLAY-ONLY estimate for the design phase.
 * Final fares and all financial calculations happen on the backend (PRD §15 rule 18).
 */
export function estimateFare(
  category: VehicleCategory,
  miles: number,
  minutes: number,
  roundTrip = false,
) {
  const one = category.baseFare + category.perMile * miles + category.perMinute * minutes;
  const total = roundTrip ? one * 2 : one;
  return Math.round(total * 100) / 100;
}

/** Deterministic fake route stats from the entered addresses, so the UI looks live. */
export function mockRouteStats(pickup: string, destination: string) {
  const seed = [...(pickup + destination)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const miles = 4 + (seed % 180) / 10;
  const minutes = Math.round(miles * 2.4 + 6);
  return { miles: Math.round(miles * 10) / 10, minutes };
}

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
