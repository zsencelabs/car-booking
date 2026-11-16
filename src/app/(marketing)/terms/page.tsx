import type { Metadata } from "next";
import { PageHero, Section } from "@/components/common/section";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function Page() {
  return (
    <>
      <PageHero title="Terms & conditions" />
      <Section>
        <div className="max-w-3xl rounded-xl border border-dashed p-6 text-muted-foreground">
          Placeholder. Final terms must be written and reviewed by qualified counsel once the operating model and launch jurisdiction are decided.
        </div>
      </Section>
    </>
  );
}
