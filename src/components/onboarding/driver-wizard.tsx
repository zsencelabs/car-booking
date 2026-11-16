"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DRIVER_DOCUMENTS } from "@/lib/mock/document-requirements";
import { FileDropzone } from "./file-dropzone";
import { ReviewList, Wizard, type WizardStep } from "./wizard";

const eighteenYearsAgo = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; };

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\+?[\d\s()-]{10,}$/, "Enter a valid phone number"),
  password: z.string().min(8, "At least 8 characters"),
  legalName: z.string().trim().min(2, "Legal full name is required"),
  dob: z.string().min(1, "Date of birth is required").refine((v) => new Date(v) <= eighteenYearsAgo(), "You must be at least 18"),
  street: z.string().trim().min(3, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().regex(/^[A-Za-z]{2}$/, "2-letter state"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  docs: z.record(z.string(), z.string()),
  consentBackground: z.boolean().refine((v) => v, "Consent is required to proceed"),
  consentAccuracy: z.boolean().refine((v) => v, "Please confirm your information is accurate"),
  emergencyName: z.string().trim().min(2, "Contact name is required"),
  emergencyPhone: z.string().regex(/^\+?[\d\s()-]{10,}$/, "Enter a valid phone number"),
  emergencyRelation: z.string().trim().min(2, "Relationship is required"),
}).superRefine((v, ctx) => {
  DRIVER_DOCUMENTS.filter((d) => d.required && !d.conditional).forEach((d) => {
    if (!v.docs[d.id]) ctx.addIssue({ code: "custom", path: ["docs", d.id], message: `${d.label} is required` });
  });
});
type Values = z.infer<typeof schema>;

export function DriverWizard() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { docs: {}, consentBackground: false, consentAccuracy: false },
  });
  const reg = form.register;
  const e = form.formState.errors;

  const steps: WizardStep<Values>[] = [
    { id: "account", title: "Create your account", fields: ["email", "phone", "password"], render: () => (<>
      <FormField id="email" label="Email" error={e.email}><Input id="email" type="email" autoComplete="email" {...reg("email")} aria-invalid={!!e.email} /></FormField>
      <FormField id="phone" label="Mobile phone" error={e.phone}><Input id="phone" type="tel" autoComplete="tel" {...reg("phone")} aria-invalid={!!e.phone} /></FormField>
      <FormField id="password" label="Password" error={e.password} hint="At least 8 characters"><Input id="password" type="password" autoComplete="new-password" {...reg("password")} aria-invalid={!!e.password} /></FormField>
    </>) },
    { id: "personal", title: "Personal information", description: "Must match your government-issued ID.", fields: ["legalName", "dob", "street", "city", "state", "zip"], render: () => (<>
      <FormField id="legalName" label="Legal full name" error={e.legalName}><Input id="legalName" autoComplete="name" {...reg("legalName")} aria-invalid={!!e.legalName} /></FormField>
      <FormField id="dob" label="Date of birth" error={e.dob}><Input id="dob" type="date" {...reg("dob")} aria-invalid={!!e.dob} /></FormField>
      <FormField id="street" label="Residential address" error={e.street}><Input id="street" autoComplete="street-address" {...reg("street")} aria-invalid={!!e.street} /></FormField>
      <div className="grid grid-cols-[1fr_5rem_6rem] gap-3">
        <FormField id="city" label="City" error={e.city}><Input id="city" {...reg("city")} aria-invalid={!!e.city} /></FormField>
        <FormField id="state" label="State" error={e.state}><Input id="state" maxLength={2} {...reg("state")} aria-invalid={!!e.state} /></FormField>
        <FormField id="zip" label="ZIP" error={e.zip}><Input id="zip" inputMode="numeric" {...reg("zip")} aria-invalid={!!e.zip} /></FormField>
      </div>
    </>) },
    { id: "documents", title: "Identity and driving documents", description: "Requirements vary by state and city. You may be asked for more later.", fields: ["docs"], render: (f) => (
      <div className="space-y-3">
        {DRIVER_DOCUMENTS.map((d) => (
          <FileDropzone key={d.id} doc={d} value={f.watch(`docs.${d.id}`)} onChange={(n) => f.setValue(`docs.${d.id}`, n, { shouldValidate: true })} error={(e.docs as Record<string, { message?: string }> | undefined)?.[d.id]?.message} />
        ))}
      </div>
    ) },
    { id: "consent", title: "Background verification", description: "Checks are run through compliant providers. You cannot accept jobs until you are approved.", fields: ["consentBackground", "consentAccuracy"], render: (f) => (<>
      {([["consentBackground", "I consent to a criminal background check, motor vehicle record check and sex offender registry check."], ["consentAccuracy", "I confirm all information and documents I provide are accurate."]] as const).map(([k, text]) => (
        <div key={k} className="space-y-1">
          <div className="flex items-start gap-2"><Checkbox id={k} checked={f.watch(k)} onCheckedChange={(v) => f.setValue(k, v === true, { shouldValidate: true })} /><Label htmlFor={k} className="text-sm font-normal leading-snug">{text}</Label></div>
          {e[k] && <p role="alert" className="text-xs text-destructive">{e[k]?.message}</p>}
        </div>
      ))}
    </>) },
    { id: "emergency", title: "Emergency contact", fields: ["emergencyName", "emergencyPhone", "emergencyRelation"], render: () => (<>
      <FormField id="emergencyName" label="Contact name" error={e.emergencyName}><Input id="emergencyName" {...reg("emergencyName")} aria-invalid={!!e.emergencyName} /></FormField>
      <FormField id="emergencyPhone" label="Contact phone" error={e.emergencyPhone}><Input id="emergencyPhone" type="tel" {...reg("emergencyPhone")} aria-invalid={!!e.emergencyPhone} /></FormField>
      <FormField id="emergencyRelation" label="Relationship" error={e.emergencyRelation}><Input id="emergencyRelation" {...reg("emergencyRelation")} aria-invalid={!!e.emergencyRelation} /></FormField>
    </>) },
    { id: "review", title: "Review and submit", fields: [], render: (f) => { const v = f.getValues(); return (
      <ReviewList rows={[["Email", v.email], ["Legal name", v.legalName], ["Date of birth", v.dob], ["Address", `${v.street}, ${v.city}, ${v.state?.toUpperCase()} ${v.zip}`], ["Documents uploaded", String(Object.keys(v.docs).length)], ["Emergency contact", `${v.emergencyName} (${v.emergencyRelation})`]]} />
    ); } },
  ];

  return <Wizard form={form} steps={steps} onSubmit={() => {}} submitLabel="Submit application" doneTitle="Application submitted" doneText="Thanks! Our team will verify your documents and background checks. You'll be notified by email. You can start accepting jobs once you are approved and have an approved vehicle assignment." />;
}
