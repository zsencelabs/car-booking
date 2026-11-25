"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addYears, parseISO, subYears } from "date-fns";
import { z } from "zod";
import { DatePicker, formatDateLabel } from "@/components/common/date-picker";
import { FormField } from "@/components/common/field";
import { PhoneInput } from "@/components/common/phone-input";
import { PasswordInput } from "@/components/common/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";
import { phoneSchema } from "@/lib/phone";
import { ReviewList, Wizard, type WizardResult, type WizardStep } from "./wizard";

const eighteenYearsAgo = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; };

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: phoneSchema,
  password: z.string().min(10, "At least 10 characters").max(200),
  legalName: z.string().trim().min(2, "Legal full name is required"),
  dob: z.string().min(1, "Date of birth is required").refine((v) => parseISO(v) <= eighteenYearsAgo(), "You must be at least 18"),
  street: z.string().trim().min(3, "Street address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().regex(/^[A-Za-z]{2}$/, "2-letter state"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  licenseNumber: z.string().trim().min(4, "License number is required").max(32),
  licenseState: z.string().regex(/^[A-Za-z]{2}$/, "2-letter state"),
  licenseExpiry: z.string().min(1, "Expiry date is required").refine((v) => parseISO(v) > new Date(), "This license has expired"),
  consentBackground: z.boolean().refine((v) => v, "Consent is required to proceed"),
  consentAccuracy: z.boolean().refine((v) => v, "Please confirm your information is accurate"),
  emergencyName: z.string().trim().min(2, "Contact name is required"),
  emergencyPhone: phoneSchema,
});
type Values = z.infer<typeof schema>;

/** API field names, mapped back to this form's fields so server errors land on the right input. */
const API_FIELDS: Record<string, keyof Values> = {
  name: "legalName", email: "email", phone: "phone", password: "password", dateOfBirth: "dob", addressLine: "street",
  city: "city", state: "state", postalCode: "zip", licenseNumber: "licenseNumber", licenseState: "licenseState",
  licenseExpiresAt: "licenseExpiry", emergencyContactName: "emergencyName", emergencyContactPhone: "emergencyPhone",
};

async function apply(v: Values): Promise<WizardResult> {
  const res = await signUp(
    { role: "DRIVER", name: v.legalName, email: v.email, password: v.password, phone: v.phone },
    {
      path: "/drivers/me",
      body: {
        dateOfBirth: v.dob, addressLine: v.street, city: v.city, state: v.state.toUpperCase(), postalCode: v.zip,
        licenseNumber: v.licenseNumber, licenseState: v.licenseState.toUpperCase(), licenseExpiresAt: v.licenseExpiry,
        emergencyContactName: v.emergencyName, emergencyContactPhone: v.emergencyPhone,
      },
    },
  );
  if (res.ok) return res;
  const fields = Object.fromEntries(Object.entries(res.fields ?? {}).map(([k, m]) => [API_FIELDS[k] ?? k, m]));
  return { ...res, fields };
}

export function DriverWizard() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { dob: "", licenseExpiry: "", consentBackground: false, consentAccuracy: false },
  });
  const reg = form.register;
  const e = form.formState.errors;

  const steps: WizardStep<Values>[] = [
    { id: "account", title: "Create your account", fields: ["email", "phone", "password"], render: () => (<>
      <FormField id="email" label="Email" error={e.email}><Input id="email" type="email" autoComplete="email" {...reg("email")} aria-invalid={!!e.email} /></FormField>
      <FormField id="phone" label="Mobile phone" error={e.phone}><Controller name="phone" control={form.control} render={({ field }) => <PhoneInput id="phone" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e.phone} />} /></FormField>
      <FormField id="password" label="Password" error={e.password} hint="At least 10 characters"><PasswordInput id="password" autoComplete="new-password" {...reg("password")} aria-invalid={!!e.password} /></FormField>
    </>) },
    { id: "personal", title: "Personal information", description: "Must match your government-issued ID.", fields: ["legalName", "dob", "street", "city", "state", "zip"], render: () => (<>
      <FormField id="legalName" label="Legal full name" error={e.legalName}><Input id="legalName" autoComplete="name" {...reg("legalName")} aria-invalid={!!e.legalName} /></FormField>
      <FormField id="dob" label="Date of birth" error={e.dob}><Controller name="dob" control={form.control} render={({ field }) => <DatePicker id="dob" startView="year" placeholder="Select your date of birth" min={subYears(new Date(), 100)} max={eighteenYearsAgo()} rangeMessage="You must be at least 18" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e.dob} />} /></FormField>
      <FormField id="street" label="Residential address" error={e.street}><Input id="street" autoComplete="street-address" {...reg("street")} aria-invalid={!!e.street} /></FormField>
      <div className="grid grid-cols-[1fr_5rem_6rem] gap-3">
        <FormField id="city" label="City" error={e.city}><Input id="city" {...reg("city")} aria-invalid={!!e.city} /></FormField>
        <FormField id="state" label="State" error={e.state}><Input id="state" maxLength={2} {...reg("state")} aria-invalid={!!e.state} /></FormField>
        <FormField id="zip" label="ZIP" error={e.zip}><Input id="zip" inputMode="numeric" {...reg("zip")} aria-invalid={!!e.zip} /></FormField>
      </div>
    </>) },
    { id: "license", title: "Driver's license", description: "We check it during verification and remind you before it expires. You can't take jobs with an expired license.", fields: ["licenseNumber", "licenseState", "licenseExpiry"], render: () => (<>
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <FormField id="licenseNumber" label="License number" error={e.licenseNumber}><Input id="licenseNumber" autoComplete="off" {...reg("licenseNumber")} aria-invalid={!!e.licenseNumber} /></FormField>
        <FormField id="licenseState" label="State" error={e.licenseState}><Input id="licenseState" maxLength={2} {...reg("licenseState")} aria-invalid={!!e.licenseState} /></FormField>
      </div>
      <FormField id="licenseExpiry" label="Expiration date" error={e.licenseExpiry}><Controller name="licenseExpiry" control={form.control} render={({ field }) => <DatePicker id="licenseExpiry" placeholder="Select expiration date" min={addDays(new Date(), 1)} max={addYears(new Date(), 15)} rangeMessage="This license has expired" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e.licenseExpiry} />} /></FormField>
      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Document uploads aren&apos;t available yet. Our verification team will contact you for copies of your license and other documents.</p>
    </>) },
    { id: "consent", title: "Background verification", description: "Checks are run through compliant providers. You cannot accept jobs until you are approved.", fields: ["consentBackground", "consentAccuracy"], render: (f) => (<>
      {([["consentBackground", "I consent to a criminal background check, motor vehicle record check and sex offender registry check."], ["consentAccuracy", "I confirm all information and documents I provide are accurate."]] as const).map(([k, text]) => (
        <div key={k} className="space-y-1">
          <div className="flex items-start gap-2"><Checkbox id={k} checked={f.watch(k)} onCheckedChange={(v) => f.setValue(k, v === true, { shouldValidate: true })} /><Label htmlFor={k} className="text-sm font-normal leading-snug">{text}</Label></div>
          {e[k] && <p role="alert" className="text-xs text-destructive">{e[k]?.message}</p>}
        </div>
      ))}
    </>) },
    { id: "emergency", title: "Emergency contact", fields: ["emergencyName", "emergencyPhone"], render: () => (<>
      <FormField id="emergencyName" label="Contact name" error={e.emergencyName}><Input id="emergencyName" {...reg("emergencyName")} aria-invalid={!!e.emergencyName} /></FormField>
      <FormField id="emergencyPhone" label="Contact phone" error={e.emergencyPhone}><Controller name="emergencyPhone" control={form.control} render={({ field }) => <PhoneInput id="emergencyPhone" autoComplete="off" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e.emergencyPhone} />} /></FormField>
    </>) },
    { id: "review", title: "Review and submit", fields: [], render: (f) => { const v = f.getValues(); return (
      <ReviewList rows={[["Email", v.email], ["Legal name", v.legalName], ["Date of birth", formatDateLabel(v.dob)], ["Address", `${v.street}, ${v.city}, ${v.state?.toUpperCase()} ${v.zip}`], ["License", `${v.licenseNumber} (${v.licenseState?.toUpperCase()}) · expires ${formatDateLabel(v.licenseExpiry)}`], ["Emergency contact", v.emergencyName]]} />
    ); } },
  ];

  return <Wizard form={form} steps={steps} onSubmit={apply} submitLabel="Submit application" doneTitle="Application submitted" doneText="Thanks! You're signed in. Our team will review your license and background checks. You can accept jobs once you're approved and a fleet assigns you an approved vehicle." />;
}
