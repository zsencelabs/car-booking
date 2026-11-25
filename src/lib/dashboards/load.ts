import "server-only";
import { api } from "@/lib/api/server";
import type {
  AdminDriver, AdminProvider, Assignment, AuditEntry, Booking, BookingStatus, Category, Compensation, DriverInvitation, DriverProfile,
  Invitation, Job, Page, Provider, ProviderDriver, Vehicle,
} from "@/lib/api/types";
import type { Role, SessionUser } from "@/lib/auth/roles";
import { BOOKING_STATUS, day, money, shortPlace, VEHICLE_STATUS, VERIFICATION, when } from "@/lib/format";
import { viewerTimeZone } from "@/lib/time-zone";
import type { VehicleCategoryId } from "@/types";
import type { DashboardConfig, DashboardRow, RowAction, WorkItem } from "./types";

// ── Shared helpers ──

const ART: VehicleCategoryId[] = ["economy", "comfort", "premium", "suv", "luxury", "van"];
const art = (categoryId: string): VehicleCategoryId => (ART.includes(categoryId as VehicleCategoryId) ? (categoryId as VehicleCategoryId) : "comfort");

const PAINT = { pearl: "#e9e9e4", graphite: "#34373c", silver: "#a9adb2", onyx: "#1e2024", forest: "#2f5d46", ember: "#a23b2d", ocean: "#2f5f8f" };
const CLASS_PAINT: Record<VehicleCategoryId, string> = { economy: PAINT.ocean, comfort: PAINT.silver, premium: PAINT.onyx, suv: PAINT.forest, luxury: PAINT.graphite, van: PAINT.pearl };

/** A paint colour for the vehicle illustration, from the vehicle's colour name. */
function paint(color?: string, categoryId = "comfort") {
  const c = (color ?? "").toLowerCase();
  if (/black/.test(c)) return PAINT.onyx;
  if (/white|pearl|ivory/.test(c)) return PAINT.pearl;
  if (/silver|gr[ae]y/.test(c)) return PAINT.silver;
  if (/blue|navy/.test(c)) return PAINT.ocean;
  if (/red|maroon|burgundy/.test(c)) return PAINT.ember;
  if (/green/.test(c)) return PAINT.forest;
  return color ? PAINT.graphite : CLASS_PAINT[art(categoryId)];
}

const route = (b: { pickupAddress: string; dropoffAddress: string }) => `${shortPlace(b.pickupAddress)} to ${shortPlace(b.dropoffAddress)}`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const fareOf = (b: Booking) => b.finalFareCents ?? b.quotedFareCents;

/** Statuses where a ride is still to come or under way. */
const LIVE: BookingStatus[] = ["PENDING", "SEARCHING", "AWAITING_PROVIDER", "DRIVER_ASSIGNED", "CONFIRMED", "DRIVER_EN_ROUTE", "DRIVER_ARRIVED", "IN_PROGRESS"];
const DONE: BookingStatus[] = ["COMPLETED", "PAYMENT_PENDING", "PAID"];

/** Totals per month for the last six months, oldest first. */
function monthly(rows: { at: string; value: number }[], tz: string) {
  const label = (d: Date) => d.toLocaleDateString("en-US", { month: "short", timeZone: tz });
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => label(new Date(now.getFullYear(), now.getMonth() - 5 + i, 15)));
  const totals = new Map(months.map((m) => [m, 0]));
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1).getTime();
  for (const r of rows) if (new Date(r.at).getTime() >= cutoff) totals.set(label(new Date(r.at)), (totals.get(label(new Date(r.at))) ?? 0) + r.value);
  return months.map((m) => ({ label: m, value: Math.round((totals.get(m) ?? 0) * 100) / 100 }));
}

// ── Customer ──

async function customer(tz: string): Promise<DashboardConfig> {
  const [categories, bookings] = await Promise.all([
    api<Category[]>("/vehicle-categories", { auth: false }),
    api<Page<Booking>>("/bookings", { query: { limit: 100 } }),
  ]);
  const items: WorkItem[] = categories.map((c, i) => ({
    id: c.id,
    title: c.name,
    subtitle: c.examples || c.description,
    vehicle: art(c.id),
    tint: CLASS_PAINT[art(c.id)],
    price: c.minimumFareCents / 100,
    unit: "minimum",
    distance: i,
    meta: `${plural(c.passengers, "seat")} · ${plural(c.luggage, "bag")}`,
    facets: { Class: c.name, Seats: `${c.passengers} seats`, Luggage: c.luggage >= 5 ? "Large" : c.luggage >= 3 ? "Medium" : "Small" },
    href: `/book?categoryId=${c.id}`,
  }));

  const rideRow = (b: Booking): DashboardRow => ({
    id: b.id,
    title: route(b),
    meta: `${when(b.scheduledAt, tz)} · ${b.category.name} · ${b.reference}`,
    value: money(fareOf(b)),
    status: BOOKING_STATUS[b.status],
    href: `/rides/${b.id}`,
  });
  const upcoming = bookings.items.filter((b) => LIVE.includes(b.status)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const past = bookings.items.filter((b) => !LIVE.includes(b.status));
  const completed = past.filter((b) => DONE.includes(b.status));
  const spent = completed.reduce((n, b) => n + fareOf(b), 0);

  return {
    nav: [
      { id: "vehicles", label: "Vehicles", icon: "car" },
      { id: "rides", label: "My rides", icon: "calendar" },
      { id: "receipts", label: "Receipts", icon: "receipt" },
    ],
    workspace: {
      noun: "vehicle classes", priceLabel: "Minimum fare", items, favourites: true, closestLabel: "Recommended",
      filters: [{ key: "Class", label: "Vehicle class", kind: "checks" }, { key: "Seats", label: "Seats", kind: "pills" }, { key: "Luggage", label: "Luggage", kind: "pills" }],
      empty: { title: "No vehicle classes yet", text: "Check back soon." },
    },
    panels: {
      rides: {
        title: "My rides", text: "Your upcoming and past trips. Open a ride to track it or cancel it.",
        stats: [{ k: String(upcoming.length), v: "upcoming rides" }, { k: String(completed.length), v: "completed rides" }, { k: String(past.length - completed.length), v: "cancelled" }],
        sections: [
          { title: "Upcoming", rows: upcoming.map(rideRow), empty: "No upcoming rides. Book one from the Vehicles tab." },
          { title: "Past rides", rows: past.map(rideRow), empty: "Your finished rides will show here." },
        ],
      },
      receipts: {
        title: "Receipts", text: "Every completed ride and its fare. Online payment isn't live yet.",
        stats: [{ k: String(completed.length), v: "completed rides" }, { k: completed.length ? money(Math.round(spent / completed.length)) : "$0", v: "average fare" }, { k: money(spent), v: "total fares" }],
        chart: completed.length ? { title: "Monthly ride fares", caption: "Last 6 months", prefix: "$", bars: monthly(completed.map((b) => ({ at: b.completedAt ?? b.scheduledAt, value: fareOf(b) / 100 })), tz) } : undefined,
        sections: [{ title: "Completed rides", rows: completed.map(rideRow), empty: "No completed rides yet." }],
      },
    },
  };
}

// ── Driver ──

const NEXT_STEP: Partial<Record<BookingStatus, { label: string; status: "DRIVER_EN_ROUTE" | "DRIVER_ARRIVED" | "IN_PROGRESS" | "COMPLETED" }>> = {
  DRIVER_ASSIGNED: { label: "On my way", status: "DRIVER_EN_ROUTE" },
  CONFIRMED: { label: "On my way", status: "DRIVER_EN_ROUTE" },
  DRIVER_EN_ROUTE: { label: "I've arrived", status: "DRIVER_ARRIVED" },
  DRIVER_ARRIVED: { label: "Start ride", status: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete ride", status: "COMPLETED" },
};

function driverNotice(profile: DriverProfile) {
  if (profile.verificationStatus === "PENDING") {
    const missing = !profile.licenseNumber || !profile.licenseExpiresAt || !profile.dateOfBirth;
    return missing ? "Your application is missing license details. Add them in Profile so we can review it." : "Your application is in review. You can accept jobs once you're approved and a fleet assigns you a vehicle.";
  }
  if (profile.verificationStatus === "REJECTED") return `Your application wasn't approved${profile.verificationNote ? `: ${profile.verificationNote}` : "."} Update your license details to have it reviewed again.`;
  if (profile.verificationStatus === "SUSPENDED") return `Your driver profile is suspended${profile.verificationNote ? `: ${profile.verificationNote}` : "."} Contact support.`;
  if (profile.providers.length === 0) return "You're approved. Join a fleet with an invitation code to get a vehicle.";
  if (!profile.canAcceptJobs) return "You're approved, but none of your assigned vehicles can take rides right now (not approved, or papers expired). Ask your fleet.";
  return undefined;
}

async function driver(tz: string): Promise<DashboardConfig> {
  const [board, active, past, profile, invitations] = await Promise.all([
    api<{ canAcceptJobs: boolean; jobs: Job[] }>("/jobs"),
    api<Page<Booking>>("/jobs/mine", { query: { scope: "active", limit: 100 } }),
    api<Page<Booking>>("/jobs/mine", { query: { scope: "past", limit: 100 } }),
    api<DriverProfile>("/drivers/me"),
    api<DriverInvitation[]>("/drivers/me/invitations"),
  ]);
  const notice = driverNotice(profile);

  const items: WorkItem[] = board.jobs.map((j) => ({
    id: j.id,
    title: route(j),
    subtitle: j.timing === "IMMEDIATE" ? "Now" : when(j.scheduledAt, tz),
    vehicle: art(j.categoryId),
    tint: CLASS_PAINT[art(j.categoryId)],
    price: (j.estimatedPayCents ?? 0) / 100,
    unit: j.estimatedPayCents === null ? "pay not set" : "est. pay",
    distance: j.distanceMiles,
    meta: `${j.distanceMiles} mi${j.tripType === "ROUND_TRIP" ? " each way" : ""} · ${plural(j.passengers, "rider")}`,
    status: "New",
    facets: { "Ride type": j.timing === "IMMEDIATE" ? "Now" : j.tripType === "ROUND_TRIP" ? "Round trip" : "Scheduled", Class: j.category.name, Company: j.provider.name },
    action: { label: "Accept", done: "Accepted", op: { kind: "job.accept", id: j.id } },
  }));

  const activeRow = (b: Booking): DashboardRow => {
    const next = NEXT_STEP[b.status];
    const actions: RowAction[] = [];
    if (next) actions.push({ label: next.label, tone: "primary", op: { kind: "job.status", id: b.id, status: next.status } });
    if (b.status === "DRIVER_ASSIGNED" || b.status === "CONFIRMED") actions.push({ label: "Release", tone: "danger", op: { kind: "job.release", id: b.id } });
    return {
      id: b.id,
      title: route(b),
      meta: `${when(b.scheduledAt, tz)} · ${b.vehicle ? `${b.vehicle.make} ${b.vehicle.model} ${b.vehicle.licensePlate}` : b.category.name} · ${plural(b.passengers, "rider")}${b.notes ? ` · Note: ${b.notes}` : ""}`,
      value: money(fareOf(b)),
      status: BOOKING_STATUS[b.status],
      actions,
    };
  };
  const pastRow = (b: Booking): DashboardRow => ({ id: b.id, title: route(b), meta: `${when(b.scheduledAt, tz)} · ${b.reference}`, value: money(fareOf(b)), status: BOOKING_STATUS[b.status] });
  const completed = past.items.filter((b) => DONE.includes(b.status));

  return {
    nav: [
      { id: "jobs", label: "Available jobs", icon: "briefcase" },
      { id: "mine", label: "My jobs", icon: "list" },
      { id: "profile", label: "Profile", icon: "file" },
      { id: "fleets", label: "Fleets", icon: "building" },
    ],
    workspace: {
      noun: "jobs available", priceLabel: "Estimated pay", closestLabel: "Shortest trip", items, notice,
      filters: [{ key: "Ride type", label: "Ride type", kind: "checks" }, { key: "Class", label: "Vehicle class", kind: "checks" }, { key: "Company", label: "Fleet", kind: "checks" }],
      empty: board.canAcceptJobs
        ? { title: "No open jobs right now", text: "New rides that fit your vehicles show up here. Check back soon." }
        : { title: "You can't take jobs yet", text: notice ?? "You need an approved profile and an approved vehicle.", href: "/dashboard/driver?view=profile", cta: "See your profile" },
    },
    panels: {
      mine: {
        title: "My jobs", text: "Rides you've accepted. Move each one along as you go; you can set off up to 2 hours before pickup.",
        stats: [{ k: String(active.items.length), v: "upcoming jobs" }, { k: String(completed.length), v: "completed jobs" }, { k: money(completed.reduce((n, b) => n + fareOf(b), 0)), v: "fares completed" }],
        sections: [
          { title: "Upcoming and in progress", rows: active.items.map(activeRow), empty: "No accepted jobs. Pick one from Available jobs." },
          { title: "Past jobs", rows: past.items.map(pastRow), empty: "Finished and cancelled jobs show here." },
        ],
      },
      profile: {
        title: "Profile", text: "What we verify before you can take rides.", notice,
        forms: profile.verificationStatus === "SUSPENDED" ? undefined : [{
          type: "license",
          licenseNumber: profile.licenseNumber ?? "",
          licenseState: profile.licenseState ?? "",
          licenseExpiresAt: profile.licenseExpiresAt?.slice(0, 10) ?? "",
        }],
        stats: [
          { k: VERIFICATION[profile.verificationStatus], v: "verification" },
          { k: profile.licenseExpiresAt ? day(profile.licenseExpiresAt) : "Missing", v: "license expires" },
          { k: String(profile.eligibleVehicles.length), v: "vehicles you can drive" },
        ],
        sections: [
          {
            title: "Your details",
            rows: [
              { id: "license", title: "Driver's license", meta: profile.licenseNumber ? `${profile.licenseNumber} · ${profile.licenseState} · expires ${profile.licenseExpiresAt ? day(profile.licenseExpiresAt) : "—"}` : "Not added yet", status: profile.licenseNumber ? VERIFICATION[profile.verificationStatus] : "Missing" },
              { id: "address", title: "Home address", meta: profile.addressLine ? `${profile.addressLine}, ${profile.city}, ${profile.state} ${profile.postalCode}` : "Not added yet" },
              { id: "emergency", title: "Emergency contact", meta: profile.emergencyContactName ? `${profile.emergencyContactName} · ${profile.emergencyContactPhone}` : "Not added yet" },
            ],
          },
          {
            title: "Vehicles you can drive",
            rows: profile.eligibleVehicles.map((v) => ({ id: v.id, title: `${v.make} ${v.model}`, meta: `${v.licensePlate} · ${v.provider.displayName}`, status: "Active" })),
            empty: "No approved vehicles assigned to you yet.",
          },
        ],
      },
      fleets: {
        title: "Fleets", text: "Companies you drive for, and invitations to join one.",
        stats: [{ k: String(profile.providers.length), v: "fleets joined" }, { k: String(invitations.length), v: "pending invitations" }, { k: String(profile.eligibleVehicles.length), v: "vehicles available to you" }],
        forms: [{ type: "invite-code" }],
        sections: [
          { title: "Your fleets", rows: profile.providers.map((p) => ({ id: p.id, title: p.displayName, meta: "Fleet partner", status: VERIFICATION[p.verificationStatus] })), empty: "You haven't joined a fleet yet." },
          { title: "Invitations", rows: invitations.map((i) => ({ id: i.id, title: i.provider.displayName, meta: `Expires ${when(i.expiresAt, tz)}. Ask them for the code.`, status: "Pending" })), empty: "No pending invitations for your email." },
        ],
      },
    },
  };
}

// ── Provider ──

function providerNotice(p: Provider) {
  if (p.verificationStatus === "PENDING") return "Your company is in review. You can add vehicles and invite drivers now; rides start once we approve the company and each vehicle.";
  if (p.verificationStatus === "REJECTED") return `Your company wasn't approved${p.verificationNote ? `: ${p.verificationNote}` : "."} Contact support.`;
  if (p.verificationStatus === "SUSPENDED") return `Your company is suspended${p.verificationNote ? `: ${p.verificationNote}` : "."} Contact support.`;
  return undefined;
}

async function provider(tz: string): Promise<DashboardConfig> {
  const [company, vehicles, drivers, invitations, assignments, pay, bookings, categories] = await Promise.all([
    api<Provider>("/providers/me"),
    api<Vehicle[]>("/providers/me/vehicles"),
    api<ProviderDriver[]>("/providers/me/drivers"),
    api<Invitation[]>("/providers/me/invitations"),
    api<Assignment[]>("/providers/me/assignments"),
    api<Compensation[]>("/providers/me/compensation"),
    api<Page<Booking>>("/providers/me/bookings", { query: { limit: 100 } }),
    api<Category[]>("/vehicle-categories", { auth: false }),
  ]);
  const notice = providerNotice(company);
  const driverName = new Map(drivers.map((d) => [d.id, d.user.name]));
  const completed = bookings.items.filter((b) => DONE.includes(b.status));
  const earned = new Map<string, number>();
  for (const b of completed) if (b.vehicle) earned.set(b.vehicle.id, (earned.get(b.vehicle.id) ?? 0) + fareOf(b));
  const IN_SERVICE = ["APPROVED", "AVAILABLE", "ASSIGNED"];

  const items: WorkItem[] = vehicles.map((v) => {
    const names = (v.assignments ?? []).map((a) => driverName.get(a.driverId)).filter(Boolean);
    const inService = IN_SERVICE.includes(v.status);
    const paused = v.status === "TEMPORARILY_UNAVAILABLE" || v.status === "MAINTENANCE";
    return {
      id: v.id,
      title: `${v.year} ${v.make} ${v.model}`,
      subtitle: names.length ? names.join(", ") : "No driver assigned",
      vehicle: art(v.categoryId),
      tint: paint(v.color, v.categoryId),
      price: (earned.get(v.id) ?? 0) / 100,
      unit: "completed fares",
      distance: earned.get(v.id) ?? 0,
      meta: `${v.licensePlate} · ${v.category?.name ?? v.categoryId}`,
      status: VEHICLE_STATUS[v.status],
      facets: { Status: VEHICLE_STATUS[v.status], Class: v.category?.name ?? v.categoryId },
      action: inService
        ? { label: "Mark unavailable", done: "Unavailable", op: { kind: "vehicle.availability", id: v.id, status: "TEMPORARILY_UNAVAILABLE" } }
        : paused
          ? { label: "Make available", done: "Available", op: { kind: "vehicle.availability", id: v.id, status: "AVAILABLE" } }
          : undefined,
    };
  });

  const defaultPay = pay.find((c) => c.driverId === null);
  const percent = defaultPay?.type === "PERCENT" ? defaultPay.value / 100 : null;
  const assignable = vehicles.filter((v) => !["REJECTED", "SUSPENDED", "DRAFT"].includes(v.status));
  const bookingRow = (b: Booking): DashboardRow => ({
    id: b.id,
    title: route(b),
    meta: `${when(b.scheduledAt, tz)} · ${b.driver?.user.name ?? "No driver"} · ${b.vehicle ? b.vehicle.licensePlate : b.category.name}`,
    value: money(fareOf(b)),
    status: BOOKING_STATUS[b.status],
  });
  const revenue = completed.reduce((n, b) => n + fareOf(b), 0);

  return {
    nav: [
      { id: "fleet", label: "Fleet", icon: "car" },
      { id: "add-vehicle", label: "Add vehicle", icon: "plus" },
      { id: "drivers", label: "Drivers", icon: "users" },
      { id: "assignments", label: "Assignments", icon: "list" },
      { id: "bookings", label: "Bookings", icon: "calendar" },
      { id: "company", label: "Company", icon: "building" },
    ],
    workspace: {
      noun: "vehicles in your fleet", priceLabel: "Completed fares", closestLabel: "Top earners", items, notice,
      filters: [{ key: "Status", label: "Status", kind: "checks" }, { key: "Class", label: "Vehicle class", kind: "checks" }],
      empty: { title: "No vehicles yet", text: "Add your first vehicle with its registration and insurance details. We review each one before it can take rides.", href: "/dashboard/provider?view=add-vehicle", cta: "Add a vehicle" },
    },
    panels: {
      "add-vehicle": {
        title: "Add a vehicle", text: "Every vehicle is reviewed before it can take rides. Keep registration and insurance current; expired papers stop the vehicle automatically.", notice,
        stats: [{ k: String(vehicles.length), v: "vehicles" }, { k: String(vehicles.filter((v) => v.status === "PENDING_VERIFICATION").length), v: "in review" }, { k: String(vehicles.filter((v) => IN_SERVICE.includes(v.status)).length), v: "in service" }],
        forms: [{ type: "vehicle", categories: categories.map((c) => ({ id: c.id, name: c.name, passengers: c.passengers })) }],
        sections: [],
      },
      drivers: {
        title: "Drivers", text: "Drivers who work with your company, and invitations you've sent.",
        stats: [{ k: String(drivers.length), v: "drivers" }, { k: String(drivers.filter((d) => d.verificationStatus === "APPROVED").length), v: "approved" }, { k: String(invitations.filter((i) => i.status === "PENDING").length), v: "invitations pending" }],
        forms: [{ type: "invite" }],
        sections: [
          { title: "Your drivers", rows: drivers.map((d) => ({ id: d.id, title: d.user.name, meta: `${d.user.email} · ${plural(d.assignments.length, "vehicle")}${d.licenseExpiresAt ? ` · license expires ${day(d.licenseExpiresAt)}` : ""}`, status: VERIFICATION[d.verificationStatus] })), empty: "No drivers yet. Invite one by email." },
          {
            title: "Invitations",
            rows: invitations.map((i) => ({
              id: i.id, title: i.email, meta: `Sent ${when(i.createdAt, tz)} · expires ${when(i.expiresAt, tz)}`,
              status: i.status === "PENDING" ? "Pending" : i.status === "ACCEPTED" ? "Accepted" : i.status === "REVOKED" ? "Revoked" : "Expired",
              actions: i.status === "PENDING" ? [{ label: "Revoke", tone: "danger" as const, op: { kind: "invite.revoke" as const, id: i.id } }] : undefined,
            })),
            empty: "No invitations sent.",
          },
        ],
      },
      assignments: {
        title: "Assignments", text: "Which driver may drive which vehicle. A driver sees jobs for the classes of the vehicles assigned to them.",
        stats: [{ k: String(assignments.length), v: "active assignments" }, { k: String(vehicles.filter((v) => !(v.assignments ?? []).length).length), v: "vehicles without a driver" }, { k: String(drivers.filter((d) => !d.assignments.length).length), v: "drivers without a vehicle" }],
        forms: [{
          type: "assign",
          vehicles: assignable.map((v) => ({ id: v.id, label: `${v.make} ${v.model} · ${v.licensePlate}` })),
          drivers: drivers.map((d) => ({ id: d.id, label: `${d.user.name}${d.verificationStatus !== "APPROVED" ? ` (${VERIFICATION[d.verificationStatus].toLowerCase()})` : ""}` })),
        }],
        sections: [{
          title: "Active assignments",
          rows: assignments.map((a) => ({ id: a.id, title: a.driver.user.name, meta: `${a.vehicle.make} ${a.vehicle.model} · ${a.vehicle.licensePlate} · since ${when(a.startsAt, tz)}`, status: VEHICLE_STATUS[a.vehicle.status], actions: [{ label: "End", tone: "danger" as const, op: { kind: "assignment.end" as const, id: a.id } }] })),
          empty: "No assignments yet.",
        }],
      },
      bookings: {
        title: "Bookings", text: "Rides your drivers have taken.",
        stats: [{ k: String(bookings.items.filter((b) => LIVE.includes(b.status)).length), v: "upcoming" }, { k: String(completed.length), v: "completed" }, { k: money(revenue), v: "completed fares" }],
        chart: completed.length ? { title: "Completed fares", caption: "Last 6 months", prefix: "$", bars: monthly(completed.map((b) => ({ at: b.completedAt ?? b.scheduledAt, value: fareOf(b) / 100 })), tz) } : undefined,
        sections: [
          { title: "Upcoming and in progress", rows: bookings.items.filter((b) => LIVE.includes(b.status)).map(bookingRow), empty: "No upcoming rides." },
          { title: "Past", rows: bookings.items.filter((b) => !LIVE.includes(b.status)).map(bookingRow), empty: "No past rides." },
        ],
      },
      company: {
        title: company.displayName, text: "Your company profile and driver pay.", notice,
        stats: [{ k: VERIFICATION[company.verificationStatus], v: "verification" }, { k: percent === null ? "Not set" : `${percent}%`, v: "default driver pay" }, { k: String(vehicles.length), v: "vehicles" }],
        forms: [{ type: "compensation", percent }],
        sections: [{
          title: "Details",
          rows: [
            { id: "legal", title: "Legal name", meta: company.legalName ?? "Not added" },
            { id: "ein", title: "EIN", meta: company.ein ?? "Not added" },
            { id: "address", title: "Address", meta: company.addressLine ? `${company.addressLine}, ${company.city}, ${company.state} ${company.postalCode}` : "Not added" },
            { id: "phone", title: "Phone", meta: company.phone ?? "Not added" },
          ],
        }],
      },
    },
  };
}

// ── Admin ──

async function admin(tz: string): Promise<DashboardConfig> {
  const [bookings, pendingDrivers, pendingProviders, pendingVehicles, drivers, providers, vehicles, audit] = await Promise.all([
    api<Page<Booking>>("/admin/bookings", { query: { limit: 100 } }),
    api<Page<AdminDriver>>("/admin/drivers", { query: { status: "PENDING", limit: 50 } }),
    api<Page<AdminProvider>>("/admin/providers", { query: { status: "PENDING", limit: 50 } }),
    api<Page<Vehicle>>("/admin/vehicles", { query: { status: "PENDING_VERIFICATION", limit: 50 } }),
    api<Page<AdminDriver>>("/admin/drivers", { query: { limit: 100 } }),
    api<Page<AdminProvider>>("/admin/providers", { query: { limit: 100 } }),
    api<Page<Vehicle>>("/admin/vehicles", { query: { limit: 100 } }),
    api<Page<AuditEntry>>("/admin/audit-logs", { query: { limit: 50 } }),
  ]);

  const decide = (entity: "drivers" | "providers" | "vehicles", id: string): RowAction[] => [
    { label: "Approve", tone: "primary", op: { kind: "verify", entity, id, decision: "APPROVED" } },
    { label: "Reject", tone: "danger", ask: "Reason for rejecting", op: { kind: "verify", entity, id, decision: "REJECTED" } },
  ];
  const suspendOrRestore = (entity: "drivers" | "providers" | "vehicles", id: string, suspended: boolean): RowAction[] =>
    suspended
      ? [{ label: "Reinstate", op: { kind: "verify", entity, id, decision: "APPROVED" } }]
      : [{ label: "Suspend", tone: "danger", ask: "Reason for suspending", op: { kind: "verify", entity, id, decision: "SUSPENDED" } }];

  const items: WorkItem[] = bookings.items.map((b) => ({
    id: b.id,
    title: b.reference,
    subtitle: `${route(b)} · ${when(b.scheduledAt, tz)}`,
    vehicle: art(b.category.id),
    tint: paint(b.vehicle?.color, b.category.id),
    price: fareOf(b) / 100,
    unit: "fare",
    distance: fareOf(b),
    meta: b.driver ? `${b.driver.user.name} · ${b.provider?.displayName ?? ""}` : "No driver yet",
    status: BOOKING_STATUS[b.status],
    facets: { Status: BOOKING_STATUS[b.status], Class: b.category.name },
  }));

  const pendingCount = pendingDrivers.items.length + pendingProviders.items.length + pendingVehicles.items.length;
  const byStatus = (s: BookingStatus[]) => bookings.items.filter((b) => s.includes(b.status)).length;
  const done = bookings.items.filter((b) => DONE.includes(b.status));

  return {
    nav: [
      { id: "queue", label: "Bookings", icon: "list" },
      { id: "overview", label: "Overview", icon: "overview" },
      { id: "verification", label: "Verification", icon: "shield" },
      { id: "people", label: "Drivers & fleets", icon: "users" },
      { id: "vehicles", label: "Vehicles", icon: "car" },
      { id: "audit", label: "Audit log", icon: "scroll" },
    ],
    workspace: {
      noun: "recent bookings", priceLabel: "Fare", closestLabel: "Highest fare", items,
      filters: [{ key: "Status", label: "Status", kind: "checks" }, { key: "Class", label: "Vehicle class", kind: "checks" }],
      empty: { title: "No bookings yet", text: "Bookings appear here as riders make them." },
    },
    panels: {
      overview: {
        title: "Platform overview", text: "How the marketplace is running, from the latest 100 bookings.",
        stats: [{ k: String(byStatus(LIVE)), v: "upcoming or live rides" }, { k: String(pendingCount), v: "awaiting verification" }, { k: money(done.reduce((n, b) => n + fareOf(b), 0)), v: "completed fares" }],
        chart: done.length ? { title: "Completed fares", caption: "Last 6 months", prefix: "$", bars: monthly(done.map((b) => ({ at: b.completedAt ?? b.scheduledAt, value: fareOf(b) / 100 })), tz) } : undefined,
        sections: [{
          title: "Needs attention",
          rows: [
            { id: "searching", title: "Rides without a driver", meta: "Still looking for a driver", value: String(byStatus(["SEARCHING"])), status: byStatus(["SEARCHING"]) ? "Review" : undefined },
            { id: "verify", title: "Verification queue", meta: "Drivers, fleets and vehicles", value: String(pendingCount), status: pendingCount ? "Review" : undefined, href: "/dashboard/admin?view=verification" },
          ],
        }],
      },
      verification: {
        title: "Verification", text: "Applications waiting for a decision. Approving checks the required details and expiry dates; every decision is audited.",
        stats: [{ k: String(pendingDrivers.items.length), v: "drivers" }, { k: String(pendingProviders.items.length), v: "fleets" }, { k: String(pendingVehicles.items.length), v: "vehicles" }],
        sections: [
          { title: "Drivers", rows: pendingDrivers.items.map((d) => ({ id: d.id, title: d.user.name, meta: `${d.user.email} · ${d.licenseNumber ? `license ${d.licenseNumber} (${d.licenseState}) expires ${d.licenseExpiresAt ? day(d.licenseExpiresAt) : "—"}` : "no license details yet"}`, status: "Review", actions: decide("drivers", d.id) })), empty: "No drivers waiting." },
          { title: "Fleets", rows: pendingProviders.items.map((p) => ({ id: p.id, title: p.displayName, meta: `${p.legalName ?? "No legal name"} · EIN ${p.ein ?? "missing"} · ${p.city ?? "no address"}`, status: "Review", actions: decide("providers", p.id) })), empty: "No fleets waiting." },
          { title: "Vehicles", rows: pendingVehicles.items.map((v) => ({ id: v.id, title: `${v.year} ${v.make} ${v.model}`, meta: `${v.provider?.displayName ?? ""} · ${v.licensePlate} · VIN ${v.vin} · insurance to ${day(v.insuranceExpiresAt)} · registration to ${day(v.registrationExpiresAt)}`, status: "Review", actions: decide("vehicles", v.id) })), empty: "No vehicles waiting." },
        ],
      },
      people: {
        title: "Drivers & fleets", text: "Suspend a driver or fleet to stop them taking rides. Suspending an account signs the person out everywhere.",
        stats: [{ k: String(drivers.items.length), v: "drivers" }, { k: String(providers.items.length), v: "fleets" }, { k: String(drivers.items.filter((d) => d.user.status === "SUSPENDED").length), v: "suspended accounts" }],
        sections: [
          {
            title: "Drivers",
            rows: drivers.items.map((d) => ({
              id: d.id, title: d.user.name, meta: `${d.user.email}${d.user.status === "SUSPENDED" ? " · account suspended" : ""}`, status: VERIFICATION[d.verificationStatus],
              actions: [
                ...(d.verificationStatus === "PENDING" ? [] : suspendOrRestore("drivers", d.id, d.verificationStatus === "SUSPENDED")),
                d.user.status === "SUSPENDED"
                  ? { label: "Restore account", ask: "Reason for restoring", op: { kind: "user.status" as const, id: d.user.id, status: "ACTIVE" as const } }
                  : { label: "Suspend account", tone: "danger" as const, ask: "Reason for suspending the account", op: { kind: "user.status" as const, id: d.user.id, status: "SUSPENDED" as const } },
              ],
            })),
            empty: "No drivers yet.",
          },
          {
            title: "Fleets",
            rows: providers.items.map((p) => ({ id: p.id, title: p.displayName, meta: `${p.isPlatform ? "Platform fleet · " : ""}${p._count.vehicles} vehicles · ${p._count.drivers} drivers`, status: VERIFICATION[p.verificationStatus], actions: p.verificationStatus === "PENDING" ? undefined : suspendOrRestore("providers", p.id, p.verificationStatus === "SUSPENDED") })),
            empty: "No fleets yet.",
          },
        ],
      },
      vehicles: {
        title: "Vehicles", text: "Every vehicle on the platform. Suspend one to take it off the road.",
        stats: [{ k: String(vehicles.items.length), v: "vehicles" }, { k: String(vehicles.items.filter((v) => ["APPROVED", "AVAILABLE", "ASSIGNED"].includes(v.status)).length), v: "in service" }, { k: String(vehicles.items.filter((v) => v.status === "SUSPENDED").length), v: "suspended" }],
        sections: [{
          title: "All vehicles",
          rows: vehicles.items.map((v) => ({
            id: v.id, title: `${v.year} ${v.make} ${v.model} · ${v.licensePlate}`, meta: `${v.provider?.displayName ?? ""} · ${v.category?.name ?? v.categoryId} · insurance to ${day(v.insuranceExpiresAt)}`, status: VEHICLE_STATUS[v.status],
            actions: v.status === "PENDING_VERIFICATION" || v.status === "DRAFT" ? undefined : suspendOrRestore("vehicles", v.id, v.status === "SUSPENDED"),
          })),
          empty: "No vehicles yet.",
        }],
      },
      audit: {
        title: "Audit log", text: "Sensitive changes, newest first.",
        stats: [{ k: String(audit.items.length), v: "recent events" }, { k: String(audit.items.filter((a) => a.action.endsWith(".approved")).length), v: "approvals" }, { k: String(audit.items.filter((a) => /suspend|reject/.test(a.action)).length), v: "rejections and suspensions" }],
        sections: [{ title: "Recent activity", rows: audit.items.map((a) => ({ id: a.id, title: `${a.action} · ${a.entityType}`, meta: `${a.actor?.name ?? "System"} · ${when(a.createdAt, tz)} · ${a.entityId}` })), empty: "Nothing recorded yet." }],
      },
    },
  };
}

const LOADERS: Record<Role, (tz: string) => Promise<DashboardConfig>> = { customer, driver, provider, admin };

/** Builds the signed-in user's dashboard from the API. */
export async function loadDashboard(user: SessionUser): Promise<DashboardConfig> {
  return LOADERS[user.role](await viewerTimeZone());
}

