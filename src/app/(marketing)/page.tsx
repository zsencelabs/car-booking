import { CategoryRail } from "@/components/landing/category-rail";
import { FactMarquee } from "@/components/landing/fact-marquee";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { BookingSteps } from "@/components/landing/booking-steps";
import { WhyDropoff } from "@/components/landing/why-dropoff";
import { MotionProvider } from "@/components/landing/motion-provider";
import { RideLifecycle } from "@/components/landing/ride-lifecycle";
import { SafetyChecklist } from "@/components/landing/safety-checklist";
import { Testimonials } from "@/components/landing/testimonials";
import { ContactSupport } from "@/components/landing/contact-support";
import { ReadyToBook } from "@/components/landing/ready-to-book";
import { BRAND } from "@/lib/config";
import {
  LIFECYCLE_STEPS, SAFETY_FEATURES, TESTIMONIALS, TRUST_FACTS, VERIFICATION_CHECKS,
} from "@/lib/mock/content";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";

const safetyFeatures = SAFETY_FEATURES.map(({ title, text }) => ({ title, text }));

export default function HomePage() {
  return (
    <MotionProvider>
      <Hero brand={BRAND.name} />
      <FactMarquee facts={TRUST_FACTS} />
      <RideLifecycle steps={LIFECYCLE_STEPS} />
      <CategoryRail categories={VEHICLE_CATEGORIES} />
      <BookingSteps />
      <WhyDropoff />
      <SafetyChecklist groups={VERIFICATION_CHECKS} features={safetyFeatures} />

      <Testimonials items={TESTIMONIALS} />
      <ReadyToBook />
      <ContactSupport />
      <FinalCta />
    </MotionProvider>
  );
}
