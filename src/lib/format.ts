import type { BookingStatus, VehicleStatus, VerificationStatus } from "@/lib/api/types";

/** Dollars and cents from integer cents, e.g. 1234 → "$12.34". */
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export const BOOKING_STATUS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  SEARCHING: "Finding a driver",
  AWAITING_PROVIDER: "Awaiting the fleet",
  DRIVER_ASSIGNED: "Driver assigned",
  CONFIRMED: "Confirmed",
  DRIVER_EN_ROUTE: "Driver on the way",
  DRIVER_ARRIVED: "Driver arrived",
  IN_PROGRESS: "Ride in progress",
  COMPLETED: "Completed",
  PAYMENT_PENDING: "Payment pending",
  PAID: "Paid",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const VEHICLE_STATUS: Record<VehicleStatus, string> = {
  DRAFT: "Draft",
  PENDING_VERIFICATION: "In review",
  APPROVED: "Approved",
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  ON_TRIP: "On a trip",
  TEMPORARILY_UNAVAILABLE: "Unavailable",
  MAINTENANCE: "Maintenance",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
  EXPIRED_DOCUMENTS: "Papers expired",
};

export const VERIFICATION: Record<VerificationStatus, string> = {
  PENDING: "In review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

/** "Mon, Dec 1 · 8:30 AM" in the viewer's time zone (server renders use the server's zone). */
export function when(iso: string, timeZone?: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone });
  return `${date} · ${time}`;
}

/** "Dec 1, 2027" for a date-only value stored as UTC midnight. */
export const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** A short place name: the part before the first comma. */
export const shortPlace = (address: string) => address.split(",")[0].trim();

/** Dollars, for display-only figures already in dollars (e.g. the marketing rate card). */
export const usd = (dollars: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(dollars);
