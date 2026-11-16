import type { Metadata } from "next";
import { PageHero, Section } from "@/components/common/section";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <>
      <PageHero title="Privacy policy" />
      <Section>
        <div className="max-w-3xl rounded-xl border border-dashed p-6 text-muted-foreground">
          Placeholder. The final policy must cover location data, identity documents and background checks, and be reviewed by qualified counsel.
        </div>
      </Section>
    </>
  );
}
