import type { Metadata } from "next";
import { FaqAccordion } from "@/components/common/faq-accordion";
import { PageHero, Section } from "@/components/common/section";
import { FAQS } from "@/lib/mock/content";

export const metadata: Metadata = { title: "Help center" };

export default function Page() {
  return (
    <>
      <PageHero title="Help center" subtitle="Answers to common questions about booking, payments, driving and fleets." />
      <Section><FaqAccordion items={FAQS} /></Section>
    </>
  );
}
