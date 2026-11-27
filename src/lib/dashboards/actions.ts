"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api, ApiError, errorMessage } from "@/lib/api/server";
import type { Invitation } from "@/lib/api/types";
import { getSessionUser } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/roles";
import type { Op } from "./types";

export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string; fields?: Record<string, string> };

const id = z.string().min(1).max(64);
const note = z.string().trim().min(2, "Give a short reason").max(500).optional();

const opSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("job.accept"), id }),
  z.object({ kind: z.literal("job.status"), id, status: z.enum(["DRIVER_EN_ROUTE", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"]) }),
  z.object({ kind: z.literal("job.release"), id }),
  z.object({ kind: z.literal("vehicle.availability"), id, status: z.enum(["AVAILABLE", "TEMPORARILY_UNAVAILABLE", "MAINTENANCE"]) }),
  z.object({ kind: z.literal("invite.revoke"), id }),
  z.object({ kind: z.literal("assignment.end"), id }),
  z.object({ kind: z.literal("verify"), entity: z.enum(["drivers", "providers", "vehicles"]), id, decision: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]) }),
  z.object({ kind: z.literal("user.status"), id, status: z.enum(["ACTIVE", "SUSPENDED"]) }),
]);

/** Which role may run each kind of change. The API checks again; this just fails fast. */
const OWNER: Record<Op["kind"], Role> = {
  "job.accept": "driver",
  "job.status": "driver",
  "job.release": "driver",
  "vehicle.availability": "provider",
  "invite.revoke": "provider",
  "assignment.end": "provider",
  verify: "admin",
  "user.status": "admin",
};

const path = (s: string) => encodeURIComponent(s);

async function signedIn(role: Role) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "Your session has ended. Please sign in again." };
  if (user.role !== role) return { ok: false as const, error: "Your account can't do that." };
  return null;
}

async function run(fn: () => Promise<unknown>, role: Role): Promise<Result> {
  try {
    await fn();
  } catch (error) {
    return { ok: false, error: errorMessage(error), fields: error instanceof ApiError ? error.fields : undefined };
  }
  revalidatePath(`/dashboard/${role}`);
  return { ok: true };
}

/** Runs a dashboard button. `input` is the note typed for a rejection or suspension. */
export async function runOp(raw: Op, input?: string): Promise<Result> {
  const parsed = opSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "That action isn't available." };
  const op = parsed.data;
  const role = OWNER[op.kind];
  const denied = await signedIn(role);
  if (denied) return denied;
  const reason = note.safeParse(input || undefined);
  if (!reason.success) return { ok: false, error: reason.error.issues[0].message };

  return run(() => {
    switch (op.kind) {
      case "job.accept":
        return api(`/jobs/${path(op.id)}/accept`, { method: "POST", body: {} });
      case "job.status":
        return api(`/jobs/${path(op.id)}/status`, { method: "POST", body: { status: op.status } });
      case "job.release":
        return api(`/jobs/${path(op.id)}/release`, { method: "POST" });
      case "vehicle.availability":
        return api(`/providers/me/vehicles/${path(op.id)}/availability`, { method: "POST", body: { status: op.status } });
      case "invite.revoke":
        return api(`/providers/me/invitations/${path(op.id)}/revoke`, { method: "POST" });
      case "assignment.end":
        return api(`/providers/me/assignments/${path(op.id)}/end`, { method: "POST" });
      case "verify":
        return api(`/admin/${op.entity}/${path(op.id)}/verification`, { method: "POST", body: { decision: op.decision, note: reason.data } });
      case "user.status":
        if (!reason.data) throw new ApiError(400, "Give a short reason");
        return api(`/admin/users/${path(op.id)}/status`, { method: "POST", body: { status: op.status, note: reason.data } });
    }
  }, role);
}

// ── Forms ──

/** Invites a driver by email. Returns the one-time code to pass on, until email sending is live. */
export async function inviteDriver(email: string): Promise<Result<{ token: string; email: string }>> {
  const denied = await signedIn("provider");
  if (denied) return denied;
  const parsed = z.string().trim().toLowerCase().email().max(254).safeParse(email);
  if (!parsed.success) return { ok: false, error: "Enter a valid email" };
  try {
    const invite = await api<Invitation>("/providers/me/invitations", { method: "POST", body: { email: parsed.data } });
    revalidatePath("/dashboard/provider");
    return { ok: true, data: { token: invite.token ?? "", email: invite.email } };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function acceptInvitation(token: string): Promise<Result> {
  const denied = await signedIn("driver");
  if (denied) return denied;
  const parsed = z.string().trim().min(20, "Paste the full invitation code").max(200).safeParse(token);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  return run(() => api("/drivers/me/invitations/accept", { method: "POST", body: { token: parsed.data } }), "driver");
}

export async function assignVehicle(vehicleId: string, driverId: string): Promise<Result> {
  const denied = await signedIn("provider");
  if (denied) return denied;
  if (!id.safeParse(vehicleId).success || !id.safeParse(driverId).success) return { ok: false, error: "Choose a vehicle and a driver" };
  return run(() => api("/providers/me/assignments", { method: "POST", body: { vehicleId, driverId } }), "provider");
}

/** Sets the company's default driver pay as a percentage of its share of each fare. */
export async function setDriverPay(percent: number): Promise<Result> {
  const denied = await signedIn("provider");
  if (denied) return denied;
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return { ok: false, error: "Enter a percentage from 0 to 100" };
  return run(() => api("/providers/me/compensation", { method: "POST", body: { type: "PERCENT", value: Math.round(percent * 100) } }), "provider");
}

const vehicleSchema = z.object({
  categoryId: z.string().min(1).max(32),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int(),
  vin: z.string().trim().toUpperCase(),
  licensePlate: z.string().trim().toUpperCase(),
  registrationState: z.string().trim().toUpperCase(),
  color: z.string().trim(),
  passengerCapacity: z.coerce.number().int(),
  luggageCapacity: z.coerce.number().int(),
  registrationExpiresAt: z.string(),
  insuranceProvider: z.string().trim(),
  insurancePolicyNumber: z.string().trim(),
  insuranceExpiresAt: z.string(),
});

/** Adds a vehicle; it goes to review before it can take rides. The API validates every field. */
export async function addVehicle(values: Record<string, string>): Promise<Result> {
  const denied = await signedIn("provider");
  if (denied) return denied;
  const parsed = vehicleSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please fill in every field." };
  return run(() => api("/providers/me/vehicles", { method: "POST", body: parsed.data }), "provider");
}

const licenseSchema = z.object({
  licenseNumber: z.string().trim().min(4, "Enter your license number").max(32),
  licenseState: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "2-letter state"),
  licenseExpiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the expiry date"),
});

/** Updates the driver's license. Changing it after approval or rejection sends the profile back for review. */
export async function updateLicense(values: Record<string, string>): Promise<Result> {
  const denied = await signedIn("driver");
  if (denied) return denied;
  const parsed = licenseSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fields: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  return run(() => api("/drivers/me", { method: "PATCH", body: parsed.data }), "driver");
}

/** Dollars typed in a form, as whole cents. */
const dollars = (max: number) => z.coerce.number().min(0, "Can't be negative").max(max, `At most $${max}`).transform((v) => Math.round(v * 100));

const pricingSchema = z.object({
  baseFareCents: dollars(500),
  minimumFareCents: dollars(500),
  perKmBandCents: z.array(dollars(20)).min(1, "Add at least one band").max(20, "Up to 20 bands"),
});

/** Sets a vehicle class's base fare, minimum fare and per-km band rates. The API audits every change. */
export async function updatePricing(categoryId: string, values: { baseFare: string; minimumFare: string; bands: string[] }): Promise<Result> {
  const denied = await signedIn("admin");
  if (denied) return denied;
  const parsed = pricingSchema.safeParse({ baseFareCents: values.baseFare, minimumFareCents: values.minimumFare, perKmBandCents: values.bands });
  if (!id.safeParse(categoryId).success || !parsed.success) {
    return { ok: false, error: parsed.error?.issues[0]?.message ?? "Please check the rates." };
  }
  return run(() => api(`/admin/vehicle-categories/${path(categoryId)}`, { method: "PATCH", body: parsed.data }), "admin");
}
