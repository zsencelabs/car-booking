import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

/** Static stand-in for a real map (Google Maps / Mapbox arrives with the backend phase). */
export function MapPlaceholder({ pickup, destination, className }: { pickup?: string; destination?: string; className?: string }) {
  return (
    <div className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-muted", className)} aria-label="Route map preview" role="img">
      <svg className="absolute inset-0 size-full text-border" aria-hidden>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path d="M60 220 C 140 220, 140 90, 260 110 S 380 60, 440 70" fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
      </svg>
      <div className="absolute bottom-[18%] left-[8%] flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs shadow">
        <MapPin className="size-4 text-brand-ink" /> <span className="max-w-32 truncate">{pickup || "Pickup"}</span>
      </div>
      <div className="absolute right-[6%] top-[12%] flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow">
        <Navigation className="size-4" /> <span className="max-w-32 truncate">{destination || "Destination"}</span>
      </div>
    </div>
  );
}
