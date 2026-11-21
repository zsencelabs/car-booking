import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Section } from "@/components/common/section";
import { BookingWalkthrough } from "@/components/how-it-works/booking-walkthrough";
import { MotionProvider } from "@/components/landing/motion-provider";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "How it works" };

export default function Page() {
  return (
    <>
      <PageHero title="How it works" subtitle="From request to receipt: a simple booking flow with a verified driver and vehicle every time." />
      <Section>
        <MotionProvider>
          <BookingWalkthrough />
        </MotionProvider>
        <div className="mt-12 text-center">
          <Link href="/book" className={buttonVariants({ size: "lg", className: "px-6" })}>Book a ride</Link>
        </div>
      </Section>
    </>
  );
}
