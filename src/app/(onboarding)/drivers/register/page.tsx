import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { DriverWizard } from "@/components/onboarding/driver-wizard";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Drive with us" };

export default function Page() {
  return (
    <AuthShell
      variant="driver"
      wide
      eyebrow={`Drive with ${BRAND.name}`}
      headline="Start driving."
      accent="Apply in minutes."
      text="Drivers need an approved vehicle assignment from a company, an individual provider or our own fleet before performing rides."
    >
      <DriverWizard />
    </AuthShell>
  );
}
