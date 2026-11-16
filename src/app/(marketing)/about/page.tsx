import type { Metadata } from "next";
import { PageHero, Section } from "@/components/common/section";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "About us" };

export default function Page() {
  return (
    <>
      <PageHero title={`About ${BRAND.name}`} subtitle="A marketplace connecting customers with independent drivers, car owners and professional fleets." />
      <Section>
        <div className="grid max-w-4xl gap-6 text-muted-foreground md:grid-cols-2">
          <p>We operate both as a marketplace for independent transportation providers and as a provider with our own fleet and drivers, so there is always a verified option for every booking.</p>
          <p>Every provider, driver and vehicle goes through verification before it can take rides, and compliance is monitored continuously, including document expiry.</p>
        </div>
      </Section>
    </>
  );
}
