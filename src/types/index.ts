export type VehicleCategoryId =
  | "economy"
  | "comfort"
  | "premium"
  | "suv"
  | "luxury"
  | "van";

export interface VehicleCategory {
  id: VehicleCategoryId;
  name: string;
  description: string;
  passengers: number;
  luggage: number;
  /** Display-only. Real pricing is computed by the backend (PRD §15 rule 18). */
  baseFare: number;
  /** Per-km rate for the first 50 km. */
  perKm: number;
  /** Photo in /public, 1200×750. */
  image: string;
  /** Short description of the photo, for alt text. */
  imageAlt: string;
  /** Unsplash photographer. */
  photoCredit: { name: string; username: string };
  examples: string;
  eta: string;
}

export type TripType = "immediate" | "scheduled" | "one-way" | "round-trip";

/** PRD §4.3 */
export type BookingStatus =
  | "Pending"
  | "Searching for provider"
  | "Awaiting provider acceptance"
  | "Driver assigned"
  | "Confirmed"
  | "Driver on the way"
  | "Driver arrived"
  | "Ride in progress"
  | "Completed"
  | "Payment pending"
  | "Paid"
  | "Cancelled"
  | "Disputed"
  | "Refunded";

export interface BookingDraft {
  /** The pickup airport's code (see `AIRPORTS`). Pickup address and coordinates come from it. */
  pickupCode?: string;
  pickup: string;
  pickupLat?: number;
  pickupLng?: number;
  destination: string;
  destinationLat?: number;
  destinationLng?: number;
  /** YYYY-MM-DD and HH:mm in the rider's local time. */
  date: string;
  time: string;
  /** The same pickup time as an ISO timestamp, worked out in the rider's browser (their time zone). */
  at?: string;
  tripType: TripType;
  passengers: number;
  categoryId?: string;
}

