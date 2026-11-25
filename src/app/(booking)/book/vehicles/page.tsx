import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, CarFront, Users } from "lucide-react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api/server";
import type { QuoteResponse } from "@/lib/api/types";
import { draftFromParams, draftToParams, hasRoute, paramsFromRecord } from "@/lib/booking";
import { getQuotes } from "@/lib/bookings/quotes";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Choose your vehicle" };

async function VehiclesPageContent({ searchParams }: Pick<PageProps<"/book/vehicles">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  const edit = `/book?${draftToParams(draft).toString()}`;
  if (!hasRoute(draft)) redirect(edit);

  let priced: QuoteResponse | null = null;
  let problem: string | null = null;
  try {
    priced = await getQuotes(draft);
  } catch (error) {
    problem = error instanceof ApiError && error.status < 500 ? error.message : "We couldn't price this ride right now. Please try again in a moment.";
  }

  // A class picked earlier (e.g. "Book Luxury" on the home page) is shown first.
  const quotes = priced
    ? [...priced.quotes.filter((q) => q.categoryId === draft.categoryId), ...priced.quotes.filter((q) => q.categoryId !== draft.categoryId)]
    : [];

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={2} />
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight">Choose your vehicle</h1>
          {problem && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">{problem}</p>}
          {priced && quotes.length === 0 && <p className="rounded-xl border bg-card p-6 text-muted-foreground">No vehicle class fits {draft.passengers} passengers. Try splitting into two bookings.</p>}
          {quotes.map((q) => {
            const href = `/book/review?${draftToParams({ ...draft, categoryId: q.categoryId }).toString()}`;
            const picked = q.categoryId === draft.categoryId;
            return (
              <div key={q.categoryId} className={cn("flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center", picked && "border-primary ring-2 ring-primary/30")}>
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-brand-ink"><CarFront className="size-7" /></div>
                <div className="flex-1">
                  <h2 className="font-semibold">{q.categoryName}{picked && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium">Your pick</span>}</h2>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="size-3.5" />{q.passengers} seats</span>
                    <span className="flex items-center gap-1"><Briefcase className="size-3.5" />{q.luggage} bags</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="text-xl font-semibold">{money(q.fareCents)}</span>
                  <Link href={href} className={buttonVariants()}>Select</Link>
                </div>
              </div>
            );
          })}
          {priced && quotes.length > 0 && <p className="text-xs text-muted-foreground">Upfront prices from dropoff, held for 15 minutes.</p>}
          <Link href={edit} className="inline-block text-sm text-muted-foreground underline underline-offset-4">Edit ride details</Link>
        </div>
        <BookingSummary draft={draft} route={priced?.route} />
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
