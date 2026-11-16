import { CalendarDays, MapPin, Navigation } from "lucide-react";
import { MapPlaceholder } from "@/components/common/map-placeholder";
import { estimateFare, mockRouteStats, usd } from "@/lib/mock/fare";
import { TRIP_TYPES } from "@/lib/booking";
import type { BookingDraft, VehicleCategory } from "@/types";

export function BookingSummary({ draft, category }: { draft: BookingDraft; category?: VehicleCategory }) {
  const { miles, minutes } = mockRouteStats(draft.pickup, draft.destination);
  const round = draft.tripType === "round-trip";
  const fare = category ? estimateFare(category, miles, minutes, round) : undefined;
  const trip = TRIP_TYPES.find((t) => t.value === draft.tripType)?.label;
  return (
    <aside className="space-y-4 rounded-2xl border bg-card p-5">
      <MapPlaceholder pickup={draft.pickup} destination={draft.destination} />
      <dl className="space-y-3 text-sm">
        <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Pickup</dt><dd>{draft.pickup || "—"}</dd></div></div>
        <div className="flex gap-3"><Navigation className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Destination</dt><dd>{draft.destination || "—"}</dd></div></div>
        <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">{trip}</dt><dd>{draft.tripType === "immediate" ? "As soon as possible" : `${draft.date} at ${draft.time}`}</dd></div></div>
      </dl>
      <div className="border-t pt-3 text-sm text-muted-foreground">{miles} mi · about {minutes} min{round ? " each way" : ""}</div>
      {category && fare !== undefined && (
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between"><span>{category.name}{round ? " (round-trip)" : ""}</span><span className="font-semibold">{usd(fare)}</span></div>
          <p className="text-xs text-muted-foreground">Estimate for the design preview. The final fare is calculated by the server when the ride is completed.</p>
        </div>
      )}
    </aside>
  );
}
