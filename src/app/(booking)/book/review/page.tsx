import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { ConfirmBookingForm } from "@/components/booking/confirm-booking-form";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api/server";
import { requireRole } from "@/lib/auth/session";
import { draftFromParams, draftToParams, hasRoute, paramsFromRecord } from "@/lib/booking";
import { getQuotes } from "@/lib/bookings/quotes";

export const metadata: Metadata = { title: "Review & confirm" };

async function ReviewPageContent({ searchParams }: Pick<PageProps<"/book/review">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  const query = draftToParams(draft).toString();
  if (!hasRoute(draft) || !draft.categoryId) redirect(`/book?${query}`);
  await requireRole("customer", `/book/review?${query}`);

  // A fresh price for the chosen class: quotes only last 15 minutes.
  let quote, route, problem: string | null = null;
  try {
    const priced = await getQuotes(draft, draft.categoryId);
    quote = priced.quotes[0];
    route = priced.route;
    if (!quote) problem = "That vehicle class can't take this ride. Please choose another.";
  } catch (error) {
    problem = error instanceof ApiError && error.status < 500 ? error.message : "We couldn't price this ride right now. Please try again in a moment.";
  }

  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={3} />
      <h1 className="text-3xl font-semibold tracking-tight">Review and confirm</h1>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        {quote ? (
          <ConfirmBookingForm quoteToken={quote.quoteToken} />
        ) : (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <p role="alert" className="text-sm">{problem}</p>
            <Link href={`/book/vehicles?${query}`} className={buttonVariants({ variant: "outline" })}>Choose another vehicle</Link>
          </div>
        )}
        <BookingSummary draft={draft} route={route} fare={quote ? { label: quote.categoryName, cents: quote.fareCents } : undefined} />
      </div>
    </div>
  );
}

export default function ReviewPage({ searchParams }: PageProps<"/book/review">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <ReviewPageContent searchParams={searchParams} />
    </Suspense>
  );
}
