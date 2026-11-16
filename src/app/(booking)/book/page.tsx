import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { QuickBookForm } from "@/components/booking/quick-book-form";
import { draftFromParams, paramsFromRecord } from "@/lib/booking";

export const metadata: Metadata = { title: "Book a ride" };

async function BookPageContent({ searchParams }: Pick<PageProps<"/book">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={1} />
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight">Where are you going?</h1>
          <QuickBookForm initial={draft} submitLabel="Continue" />
        </div>
        <BookingSummary draft={draft} />
      </div>
    </div>
  );
}

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookPageContent searchParams={searchParams} />
    </Suspense>
  );
}
