import type { Metadata } from "next";
import { DriverWizard } from "@/components/onboarding/driver-wizard";

export const metadata: Metadata = { title: "Drive with us" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Become a driver</h1>
        <p className="mt-2 text-muted-foreground">Apply in a few minutes. Drivers need an approved vehicle assignment (from a company, an individual provider or our own fleet) before performing rides.</p>
      </div>
      <DriverWizard />
    </div>
  );
}
