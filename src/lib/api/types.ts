/** Shapes the dropoff API returns. Money is in integer cents; dates are ISO strings. */

export type ApiRole = "CUSTOMER" | "DRIVER" | "PROVIDER" | "ADMIN";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type BookingStatus =
  | "PENDING" | "SEARCHING" | "AWAITING_PROVIDER" | "DRIVER_ASSIGNED" | "CONFIRMED" | "DRIVER_EN_ROUTE" | "DRIVER_ARRIVED"
  | "IN_PROGRESS" | "COMPLETED" | "PAYMENT_PENDING" | "PAID" | "DISPUTED" | "CANCELLED" | "REFUNDED";

export type VehicleStatus =
  | "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "AVAILABLE" | "ASSIGNED" | "ON_TRIP" | "TEMPORARILY_UNAVAILABLE"
  | "MAINTENANCE" | "REJECTED" | "SUSPENDED" | "EXPIRED_DOCUMENTS";

export type Page<T> = { items: T[]; nextCursor: string | null };

export type Me = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: ApiRole;
  status: "ACTIVE" | "SUSPENDED";
  driverId: string | null;
  providerId: string | null;
};

export type AuthResult = { user: Omit<Me, "driverId" | "providerId">; accessToken: string; refreshToken: string };

export type Category = {
  id: string;
  name: string;
  description: string;
  passengers: number;
  luggage: number;
  baseFareCents: number;
  /** Per-km rate for each 50 km band: [0–50 km, 50–100 km, ...]. The last one applies beyond. */
  perKmBandCents: number[];
  minimumFareCents: number;
  examples: string;
  active: boolean;
};

export type Place = { address: string; lat: number; lng: number };

export type Quote = {
  categoryId: string;
  categoryName: string;
  passengers: number;
  luggage: number;
  fareCents: number;
  quoteToken: string;
};

export type QuoteResponse = {
  route: { distanceMiles: number; distanceKm: number; durationMinutes: number; roundTrip: boolean };
  expiresAt: string;
  quotes: Quote[];
};

export type Booking = {
  id: string;
  reference: string;
  status: BookingStatus;
  timing: "IMMEDIATE" | "SCHEDULED";
  tripType: "ONE_WAY" | "ROUND_TRIP";
  passengers: number;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  scheduledAt: string;
  distanceMiles: number;
  distanceKm: number;
  durationMinutes: number;
  quotedFareCents: number;
  finalFareCents: number | null;
  notes: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  category: { id: string; name: string };
  provider: { id: string; displayName: string } | null;
  driver: { id: string; user: { name: string } } | null;
  vehicle: { id: string; make: string; model: string; color: string; licensePlate: string; year: number } | null;
};

export type BookingEvent = {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  note: string | null;
  createdAt: string;
};

export type Job = {
  id: string;
  reference: string;
  categoryId: string;
  timing: "IMMEDIATE" | "SCHEDULED";
  tripType: "ONE_WAY" | "ROUND_TRIP";
  passengers: number;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  distanceMiles: number;
  distanceKm: number;
  durationMinutes: number;
  category: { name: string };
  estimatedPayCents: number | null;
  provider: { id: string; name: string };
};

export type DriverProfile = {
  id: string;
  dateOfBirth: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  licenseExpiresAt: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  providers: { id: string; displayName: string; verificationStatus: VerificationStatus }[];
  eligibleVehicles: { id: string; categoryId: string; make: string; model: string; licensePlate: string; provider: { displayName: string } }[];
  canAcceptJobs: boolean;
};

/** An invitation as the inviting company sees it. `token` is only returned when it is created. */
export type Invitation = {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
  token?: string;
};

/** An invitation as the invited driver sees it. */
export type DriverInvitation = { id: string; expiresAt: string; createdAt: string; provider: { id: string; displayName: string } };

export type Provider = {
  id: string;
  displayName: string;
  legalName: string | null;
  ein: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phone: string | null;
  isPlatform: boolean;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
};

export type Vehicle = {
  id: string;
  providerId: string;
  categoryId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  registrationState: string;
  color: string;
  passengerCapacity: number;
  luggageCapacity: number;
  registrationExpiresAt: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiresAt: string;
  status: VehicleStatus;
  statusNote: string | null;
  category?: { name: string };
  provider?: { id: string; displayName: string };
  /** Active assignments: which drivers can drive it. */
  assignments?: { id: string; driverId: string }[];
};

/** A driver working with the company. `id` is the driver profile id. */
export type ProviderDriver = {
  id: string;
  verificationStatus: VerificationStatus;
  licenseExpiresAt: string | null;
  user: { name: string; email: string; phone: string | null };
  assignments: { id: string; vehicleId: string }[];
  joinedAt: string;
};

export type Assignment = {
  id: string;
  startsAt: string;
  vehicle: { id: string; make: string; model: string; licensePlate: string; status: VehicleStatus };
  driver: { id: string; verificationStatus: VerificationStatus; user: { name: string } };
};

export type Compensation = {
  id: string;
  driverId: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  effectiveAt: string;
};

export type AdminDriver = DriverProfile & { user: { id: string; name: string; email: string; status: string } };
export type AdminProvider = Provider & { _count: { vehicles: number; drivers: number } };

export type AdminUser = { id: string; email: string; name: string; role: ApiRole; status: "ACTIVE" | "SUSPENDED"; createdAt: string };

export type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { name: string; email: string } | null;
};
