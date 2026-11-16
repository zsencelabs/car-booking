"use client";

import { BookingWalkthrough } from "@/components/how-it-works/booking-walkthrough";
import { MaskLines } from "./reveal";

export function BookingSteps() {
  return (
    <section className="bg-background py-24 md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">03 — How to book</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Book a ride", <span key="b" className="text-muted-foreground">in five simple steps.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Tell us where you&apos;re going, pick a vehicle, and a verified driver is confirmed. Your card is only charged once the trip is complete.
          </p>
        </div>
        <BookingWalkthrough />
      </div>
    </section>
  );
}
