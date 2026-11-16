import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingSkeleton } from "@/components/booking/booking-skeleton";
import { redirect } from "next/navigation";
import { BookingStepper } from "@/components/booking/booking-stepper";
import { BookingSummary } from "@/components/booking/booking-summary";
import { PaymentForm } from "@/components/booking/payment-form";
import { draftFromParams, draftToParams, paramsFromRecord } from "@/lib/booking";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";

export const metadata: Metadata = { title: "Review & pay" };

async function ReviewPageContent({ searchParams }: Pick<PageProps<"/book/review">, "searchParams">) {
  const draft = draftFromParams(paramsFromRecord(await searchParams));
  const category = VEHICLE_CATEGORIES.find((c) => c.id === draft.categoryId);
  if (!draft.pickup || !draft.destination || !category) redirect("/book");
  return (
    <div className="mx-auto max-w-site space-y-8 px-4 py-10">
      <BookingStepper current={3} />
      <h1 className="text-3xl font-semibold tracking-tight">Review and confirm</h1>
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <PaymentForm confirmHref={`/book/confirmation?${draftToParams(draft).toString()}`} />
        <BookingSummary draft={draft} category={category} />
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
