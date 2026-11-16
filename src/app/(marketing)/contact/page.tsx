import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/common/contact-form";
import { PageHero, Section } from "@/components/common/section";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <>
      <PageHero title="Contact us" subtitle="Questions about a ride, driving or your fleet? We're here to help." />
      <Section>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4 text-sm">
            <p className="flex items-center gap-3"><Mail className="size-5 text-brand-ink" />{BRAND.supportEmail}</p>
            <p className="flex items-center gap-3"><Phone className="size-5 text-brand-ink" />{BRAND.supportPhone}</p>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
