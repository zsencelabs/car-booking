import "server-only";
import { api } from "@/lib/api/server";
import type { QuoteResponse } from "@/lib/api/types";
import { apiTrip } from "@/lib/booking";
import type { BookingDraft } from "@/types";

type Routed = BookingDraft & { pickupLat: number; pickupLng: number; destinationLat: number; destinationLng: number };

/** Prices a drafted ride on the server: every class that fits, or just `categoryId`. */
export function getQuotes(draft: Routed, categoryId?: string) {
  const { timing, tripType } = apiTrip(draft.tripType);
  return api<QuoteResponse>("/quotes", {
    method: "POST",
    auth: false,
    body: {
      pickup: { address: draft.pickup, lat: draft.pickupLat, lng: draft.pickupLng },
      dropoff: { address: draft.destination, lat: draft.destinationLat, lng: draft.destinationLng },
      timing,
      tripType,
      passengers: draft.passengers,
      ...(timing === "SCHEDULED" && { scheduledAt: draft.at }),
      ...(categoryId && { categoryId }),
    },
  });
}

