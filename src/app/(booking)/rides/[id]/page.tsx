import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarFront, CheckCircle2, MapPin, Navigation, ShieldAlert, UserRound, XCircle } from "lucide-react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { CancelBooking } from "@/components/booking/cancel-booking";
import { StatusTimeline } from "@/components/common/status-timeline";
import { buttonVariants } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/server";
import type { Booking, BookingEvent, BookingStatus } from "@/lib/api/types";
import { requireRole } from "@/lib/auth/session";
import { BOOKING_STATUS, money, when } from "@/lib/format";
import { viewerTimeZone } from "@/lib/time-zone";

export const metadata: Metadata = { title: "Your ride", robots: { index: false } };

/** The normal path of a ride, shown as a timeline. */
const PATH: BookingStatus[] = ["SEARCHING", "DRIVER_ASSIGNED", "DRIVER_EN_ROUTE", "DRIVER_ARRIVED", "IN_PROGRESS", "COMPLETED"];
/** A rider may cancel until the ride starts (matches the API). */
const CANCELLABLE: BookingStatus[] = ["PENDING", "SEARCHING", "AWAITING_PROVIDER", "DRIVER_ASSIGNED", "CONFIRMED", "DRIVER_EN_ROUTE", "DRIVER_ARRIVED"];

async function RideContent({ params }: Pick<PageProps<"/rides/[id]">, "params">) {
  const { id } = await params;
  await requireRole("customer", `/rides/${id}`);
  let booking: Booking, events: BookingEvent[];
  try {
    [booking, events] = await Promise.all([
      api<Booking>(`/bookings/${encodeURIComponent(id)}`),
      api<BookingEvent[]>(`/bookings/${encodeURIComponent(id)}/events`),
    ]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) notFound();
    throw error;
  }
  const tz = await viewerTimeZone();
  const status = booking.status;
  const cancelled = status === "CANCELLED";
  const current = status === "CONFIRMED" ? "DRIVER_ASSIGNED" : PATH.includes(status) ? status : status === "PAID" ? "COMPLETED" : "SEARCHING";
  const fare = booking.finalFareCents ?? booking.quotedFareCents;

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center gap-3">
        {cancelled ? <XCircle className="size-9 text-muted-foreground" /> : <CheckCircle2 className="size-9 text-emerald-500" />}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{cancelled ? "Ride cancelled" : status === "SEARCHING" ? "Booking received" : BOOKING_STATUS[status]}</h1>
          <p className="text-sm text-muted-foreground">Reference {booking.reference} · {booking.category.name} · {when(booking.scheduledAt, tz)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          {!cancelled && (
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Ride status</h2>
              <StatusTimeline steps={PATH.map((s) => BOOKING_STATUS[s])} current={BOOKING_STATUS[current]} />
              {status === "SEARCHING" && <p className="mt-4 text-sm text-muted-foreground">We&apos;re offering your ride to verified drivers. This page updates when one accepts; refresh to check.</p>}
            </div>
          )}

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Your driver and vehicle</h2>
            {booking.driver && booking.vehicle ? (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-muted"><UserRound className="size-6" /></span>
                  <div><p className="font-medium">{booking.driver.user.name}</p><p className="text-sm text-muted-foreground">{booking.provider?.displayName}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-muted"><CarFront className="size-6" /></span>
                  <div><p className="font-medium">{booking.vehicle.color} {booking.vehicle.make} {booking.vehicle.model}</p><p className="font-mono text-sm text-muted-foreground">{booking.vehicle.licensePlate}</p></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{cancelled ? "No driver was assigned." : "You'll see your driver's name, car and plate here once a driver accepts."}</p>
            )}
          </div>

          {events.length > 0 && (
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-3 text-lg font-semibold">History</h2>
              <ul className="divide-y text-sm">
                {events.map((e) => (
                  <li key={e.id} className="flex justify-between gap-4 py-2.5">
                    <span>{BOOKING_STATUS[e.toStatus]}{e.note ? <span className="text-muted-foreground"> · {e.note}</span> : null}</span>
                    <span className="shrink-0 text-muted-foreground">{when(e.createdAt, tz)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {CANCELLABLE.includes(status) && <CancelBooking id={booking.id} />}
            <Link href="/dashboard/customer?view=rides" className={buttonVariants({ variant: "ghost" })}>All my rides</Link>
            <Link href="/safety" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ShieldAlert className="size-4" /> Safety</Link>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border bg-card p-5 text-sm">
          <dl className="space-y-3">
            <div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Pickup</dt><dd>{booking.pickupAddress}</dd></div></div>
            <div className="flex gap-3"><Navigation className="mt-0.5 size-4 shrink-0 text-brand-ink" /><div><dt className="text-xs text-muted-foreground">Destination</dt><dd>{booking.dropoffAddress}</dd></div></div>
          </dl>
          <p className="border-t pt-3 text-muted-foreground">{booking.distanceMiles} mi · about {booking.durationMinutes} min{booking.tripType === "ROUND_TRIP" ? " each way" : ""} · {booking.passengers} {booking.passengers === 1 ? "passenger" : "passengers"}</p>
          <div className="flex justify-between border-t pt-3">
            <span>{booking.finalFareCents !== null ? "Final fare" : "Upfront price"}</span>
            <span className="font-semibold">{money(fare)}</span>
          </div>
          {booking.cancelReason && <p className="border-t pt-3 text-muted-foreground">Reason: {booking.cancelReason}</p>}
        </aside>
      </div>
    </div>
  );
}

export default function RidePage({ params }: PageProps<"/rides/[id]">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <RideContent params={params} />
    </Suspense>
  );
}
