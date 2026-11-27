import { CalendarDays, MapPin, Navigation } from "lucide-react";
import { MapPlaceholder } from "@/components/common/map-placeholder";
import { tripLabel } from "@/lib/booking";
import { money } from "@/lib/format";
import type { BookingDraft } from "@/types";

/** The ride being booked. Route and price appear once the server has quoted it. */
export function BookingSummary({ draft, route, fare }: {
  draft: BookingDraft;
  route?: { distanceKm: number; durationMinutes: number };
  fare?: { label: string; cents: number };
}) {
  const round = draft.tripType === "round-trip";
  return (
    <aside className="space-y-4 rounded-2xl border bg-card p-5">
      <MapPlaceholder pickup={draft.pickup} destination={draft.destination} />
      <dl className="space-y-3 text-sm">
        <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Pickup</dt><dd>{draft.pickup || "—"}</dd></div></div>
        <div className="flex gap-3"><Navigation className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Destination</dt><dd>{draft.destination || "—"}</dd></div></div>
        <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">{tripLabel(draft.tripType)}</dt><dd>{draft.tripType === "immediate" ? "As soon as possible" : draft.date ? `${draft.date} at ${draft.time}` : "Choose a date and time"}</dd></div></div>
      </dl>
      {route && <div className="border-t pt-3 text-sm text-muted-foreground">{route.distanceKm} km · about {route.durationMinutes} min{round ? " each way" : ""}</div>}
      {fare && (
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>{fare.label}{round ? " (round trip)" : ""}</span><span className="font-semibold">{money(fare.cents)}</span></div>
          <p className="text-xs text-muted-foreground">Upfront price from dropoff. Online payment isn&apos;t live yet, so you won&apos;t be charged through the site.</p>
        </div>
      )}
    </aside>
  );
}
