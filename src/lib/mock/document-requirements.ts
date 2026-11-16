import type { DocumentRequirement } from "@/types";

/** Config-driven: US requirements differ by jurisdiction (PRD §7). */
export const DRIVER_DOCUMENTS: DocumentRequirement[] = [
  { id: "gov-id", label: "Government-issued ID", required: true },
  { id: "license", label: "Valid driver's license", required: true },
  { id: "mvr", label: "Driving record / MVR", description: "We can request this through a compliant provider.", required: true },
  { id: "photo", label: "Driver photograph", required: true },
  { id: "work-auth", label: "Proof of work authorization", required: true, conditional: true },
  { id: "chauffeur", label: "Local permit / chauffeur license", required: false, conditional: true },
];

export const PROVIDER_DOCUMENTS: DocumentRequirement[] = [
  { id: "business-reg", label: "Business registration", required: true },
  { id: "ein", label: "EIN / tax identification", required: true },
  { id: "operating-authority", label: "Business license or transportation operating authority", required: true, conditional: true },
  { id: "commercial-insurance", label: "Commercial insurance", required: true },
  { id: "tax-docs", label: "Tax documentation", required: true },
  { id: "local-permits", label: "Local permits", required: false, conditional: true },
];

export const VEHICLE_DOCUMENTS: DocumentRequirement[] = [
  { id: "registration", label: "Vehicle registration", required: true },
  { id: "ownership", label: "Proof of ownership / authorization to operate", required: true },
  { id: "insurance", label: "Commercial / approved transportation insurance", required: true },
  { id: "inspection", label: "Vehicle inspection certificate", required: true },
  { id: "accessibility", label: "Accessibility certification", required: false, conditional: true },
];
