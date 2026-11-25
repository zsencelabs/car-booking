"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { api, errorMessage } from "@/lib/api/server";
import type { Booking } from "@/lib/api/types";
import { getSessionUser } from "@/lib/auth/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

const bookSchema = z.object({ quoteToken: z.string().min(10).max(4096), notes: z.string().trim().max(500).optional() });

/** Books a ride from a signed quote, then opens the ride's page. */
export async function createBooking(_: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "customer") return { ok: false, error: "Sign in with a rider account to book." };
  const parsed = bookSchema.safeParse({ quoteToken: formData.get("quoteToken"), notes: formData.get("notes") || undefined });
  if (!parsed.success) return { ok: false, error: "This price is no longer valid. Go back and choose your vehicle again." };
  let booking: Booking;
  try {
    booking = await api<Booking>("/bookings", { method: "POST", body: parsed.data });
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  redirect(`/rides/${booking.id}`);
}

const cancelSchema = z.object({ id: z.string().min(1).max(64), reason: z.string().trim().max(300).optional() });

export async function cancelBooking(id: string, reason?: string): Promise<ActionResult> {
  const parsed = cancelSchema.safeParse({ id, reason: reason || undefined });
  if (!parsed.success) return { ok: false, error: "Please check the reason." };
  try {
    await api(`/bookings/${encodeURIComponent(parsed.data.id)}/cancel`, {
      method: "POST",
      body: parsed.data.reason && parsed.data.reason.length >= 2 ? { reason: parsed.data.reason } : {},
    });
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  revalidatePath(`/rides/${parsed.data.id}`);
  return { ok: true };
}
