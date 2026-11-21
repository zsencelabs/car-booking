import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ProviderWizard } from "@/components/onboarding/provider-wizard";

export const metadata: Metadata = { title: "Register your fleet" };

export default function Page() {
  return (
    <AuthShell
      variant="fleet"
      wide
      eyebrow="Register your fleet"
      headline="Put your fleet"
      accent="on the road."
      text="List your vehicles, invite drivers and manage revenue. Your company is verified before any vehicle can receive bookings."
    >
      <ProviderWizard />
    </AuthShell>
  );
}
