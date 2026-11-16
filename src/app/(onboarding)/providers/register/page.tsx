import type { Metadata } from "next";
import { ProviderWizard } from "@/components/onboarding/provider-wizard";

export const metadata: Metadata = { title: "Register your fleet" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Register as a provider</h1>
        <p className="mt-2 text-muted-foreground">List your vehicles, invite drivers and manage revenue. Your company is verified before any vehicle can receive bookings.</p>
      </div>
      <ProviderWizard />
    </div>
  );
}
