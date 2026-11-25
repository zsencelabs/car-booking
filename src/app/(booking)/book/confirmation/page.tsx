import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CarFront, CheckCircle2, ShieldAlert, Star, UserRound } from "lucide-react";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { PostRidePreview } from "@/components/booking/post-ride-preview";
import { StatusTimeline } from "@/components/common/status-timeline";
import { buttonVariants } from "@/components/ui/button";
import { draftFromParams, paramsFromRecord } from "@/lib/booking";
import { estimateFare, mockRouteStats } from "@/lib/mock/fare";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";
import type { BookingStatus } from "@/types";

export const metadata: Metadata = { title: "Booking request received" };

const TIMELINE: BookingStatus[] = ["Searching for provider", "Driver assigned", "Confirmed", "Driver on the way", "Driver arrived", "Ride in progress", "Completed", "Paid"];

async function ConfirmationPageContent({ searchParams }: Pick<PageProps<"/book/confirmation">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  const category = VEHICLE_CATEGORIES.find((c) => c.id === draft.categoryId);
  if (!draft.pickup || !draft.destination || !category) redirect("/book");
  const { miles, minutes } = mockRouteStats(draft.pickup, draft.destination);
  const fare = estimateFare(category, miles, minutes, draft.tripType === "round-trip");

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={4} />
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-9 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Booking request received <span className="text-muted-foreground">(demo)</span></h1>
          <p className="text-sm text-muted-foreground">This preview doesn&apos;t place a real booking. A reference number is assigned when bookings go live.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Ride status</h2>
            <StatusTimeline steps={TIMELINE} current="Driver assigned" />
            <p className="mt-4 text-xs text-muted-foreground">Sample status for the design preview. Real statuses are driven by the backend.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">Your driver and vehicle</h2>
            <p className="mb-4 text-xs text-muted-foreground">Sample driver and car, shown for the design only. You&apos;ll see your real driver once one accepts.</p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-muted"><UserRound className="size-6" /></span>
                <div><p className="font-medium">Michael T.</p><p className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="size-3.5 fill-amber-400 text-amber-400" />4.9 · 1,204 rides</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-muted"><CarFront className="size-6" /></span>
                <div><p className="font-medium">Black Toyota Camry</p><p className="text-sm text-muted-foreground">{category.name} · ABC-1234</p></div>
              </div>
            </div>
          </div>
          <PostRidePreview fare={fare} />
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to home</Link>
            <Link href="/safety" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ShieldAlert className="size-4" /> Report a safety issue</Link>
          </div>
        </div>
        <BookingSummary draft={draft} category={category} />
      </div>
    </div>
  );
}

export default function ConfirmationPage({ searchParams }: PageProps<"/book/confirmation">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <ConfirmationPageContent searchParams={searchParams} />
    </Suspense>
  );
}
