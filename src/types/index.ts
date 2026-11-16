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
  perMile: number;
  perMinute: number;
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
  pickup: string;
  destination: string;
  date: string;
  time: string;
  tripType: TripType;
  passengers: number;
  categoryId?: VehicleCategoryId;
}

export interface DocumentRequirement {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  /** Requirements vary by US jurisdiction (PRD §7); flag those that are conditional. */
  conditional?: boolean;
}
