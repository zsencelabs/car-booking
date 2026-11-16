import type { Metadata } from "next";
import { PageHero, Section } from "@/components/common/section";
import { SAFETY_FEATURES } from "@/lib/mock/content";

export const metadata: Metadata = { title: "Safety" };

export default function Page() {
  return (
    <>
      <PageHero title="Safety information" subtitle="Our product principle: no driver, vehicle, provider or booking becomes operational until every applicable requirement is satisfied." />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {SAFETY_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <f.icon className="mb-3 size-6 text-brand-ink" />
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="mt-1 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="font-semibold">Report a safety issue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Customers and drivers can report incidents at any time. Every report creates a trackable case reviewed by our safety team. In an emergency, call 911 first.</p>
        </div>
      </Section>
    </>
  );
}
