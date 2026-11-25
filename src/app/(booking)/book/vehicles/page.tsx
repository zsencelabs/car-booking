import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, CarFront, Clock, Users } from "lucide-react";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { buttonVariants } from "@/components/ui/button";
import { draftFromParams, draftToParams, paramsFromRecord } from "@/lib/booking";
import { estimateFare, mockRouteStats, usd } from "@/lib/mock/fare";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Choose your vehicle" };

async function VehiclesPageContent({ searchParams }: Pick<PageProps<"/book/vehicles">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  if (!draft.pickup || !draft.destination) redirect("/book");
  const { miles, minutes } = mockRouteStats(draft.pickup, draft.destination);
  const round = draft.tripType === "round-trip";
  const fitting = VEHICLE_CATEGORIES.filter((c) => c.passengers >= draft.passengers);
  // A class picked earlier (e.g. "Book Luxury" on the home page) is shown first.
  const options = draft.categoryId
    ? [...fitting.filter((c) => c.id === draft.categoryId), ...fitting.filter((c) => c.id !== draft.categoryId)]
    : fitting;

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={2} />
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Choose your vehicle</h1>
          {options.length === 0 && <p className="rounded-xl border bg-card p-6 text-muted-foreground">No category fits {draft.passengers} passengers. Try splitting into two bookings.</p>}
          {options.map((c) => {
            const href = `/book/review?${draftToParams({ ...draft, categoryId: c.id }).toString()}`;
            const picked = c.id === draft.categoryId;
            return (
              <div key={c.id} className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center", picked && "border-primary ring-2 ring-primary/30")}>
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand-ink"><CarFront className="size-7" /></div>
                <div className="flex-1">
                  <h2 className="font-semibold">{c.name}{picked && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium">Your pick</span>} <span className="text-sm font-normal text-muted-foreground">· {c.examples}</span></h2>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{c.passengers}</span>
                    <span className="flex items-center gap-1"><Briefcase className="size-3.5" />{c.luggage}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" />{c.eta} away</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="text-right">
                    <span className="block text-xs text-muted-foreground">Estimated</span>
                    <span className="text-xl font-semibold">{usd(estimateFare(c, miles, minutes, round))}</span>
                  </span>
                  <Link href={href} className={buttonVariants()}>Select</Link>
                </div>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Estimates for the design preview. Your final price is set by dropoff when you book and confirmed when the ride is completed.</p>
          <Link href={`/book?${draftToParams(draft).toString()}`} className="inline-block text-sm text-muted-foreground underline underline-offset-4">Edit ride details</Link>
        </div>
        <BookingSummary draft={draft} />
      </div>
    </div>
  );
}

export default function VehiclesPage({ searchParams }: PageProps<"/book/vehicles">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <VehiclesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
