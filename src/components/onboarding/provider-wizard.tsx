"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/common/field";
import { PasswordInput } from "@/components/common/password-input";
import { PhoneInput } from "@/components/common/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";
import { phoneSchema } from "@/lib/phone";
import { ReviewList, Wizard, type WizardResult, type WizardStep } from "./wizard";

const schema = z.object({
  name: z.string().trim().min(2, "Your full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(10, "At least 10 characters").max(200),
  phone: phoneSchema,
  companyName: z.string().trim().min(2, "Company name is required").max(200),
  legalName: z.string().trim().min(2, "Legal business name is required").max(200),
  ein: z.string().regex(/^\d{2}-?\d{7}$/, "Format: 12-3456789"),
  street: z.string().trim().min(3, "Business address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().regex(/^[A-Za-z]{2}$/, "2-letter state"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  businessPhone: phoneSchema,
  consent: z.boolean().refine((v) => v, "Please confirm to continue"),
});
type Values = z.infer<typeof schema>;

/** API field names, mapped back to this form's fields so server errors land on the right input. */
const API_FIELDS: Record<string, keyof Values> = {
  name: "name", email: "email", password: "password", companyName: "companyName", displayName: "companyName",
  legalName: "legalName", ein: "ein", addressLine: "street", city: "city", state: "state", postalCode: "zip",
};

async function apply(v: Values): Promise<WizardResult> {
  const res = await signUp(
    { role: "PROVIDER", name: v.name, email: v.email, password: v.password, phone: v.phone, companyName: v.companyName, legalName: v.legalName },
    {
      path: "/providers/me",
      body: { ein: v.ein, addressLine: v.street, city: v.city, state: v.state.toUpperCase(), postalCode: v.zip, phone: v.businessPhone },
    },
  );
  if (res.ok) return res;
  // A company phone error comes back as "phone" from the profile step; the account phone is checked first.
  const fields = Object.fromEntries(
    Object.entries(res.fields ?? {}).map(([k, m]) => [k === "phone" && res.error.startsWith("Your account was created") ? "businessPhone" : (API_FIELDS[k] ?? k), m]),
  );
  return { ...res, fields };
}

export function ProviderWizard() {
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { consent: false } });
  const reg = form.register;
  const e = form.formState.errors;
  const text = (id: keyof Values, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <FormField id={id} label={label} error={e[id] as never} hint={hint}><Input id={id} {...reg(id as never)} aria-invalid={!!e[id]} {...props} /></FormField>
  );
  const phoneField = (id: "phone" | "businessPhone", label: string) => (
    <FormField id={id} label={label} error={e[id] as never}>
      <Controller name={id} control={form.control} render={({ field }) => <PhoneInput id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e[id]} />} />
    </FormField>
  );

  const steps: WizardStep<Values>[] = [
    { id: "account", title: "Your account", description: "You'll manage the company's fleet, drivers and bookings with this login.", fields: ["name", "email", "password", "phone"], render: () => (<>
      {text("name", "Your full name", { autoComplete: "name" })}
      {text("email", "Email", { type: "email", autoComplete: "email" })}
      <FormField id="password" label="Password" error={e.password} hint="At least 10 characters"><PasswordInput id="password" autoComplete="new-password" {...reg("password")} aria-invalid={!!e.password} /></FormField>
      {phoneField("phone", "Mobile phone")}
    </>) },
    { id: "company", title: "Company details", description: "Must match your business registration.", fields: ["companyName", "legalName", "ein", "street", "city", "state", "zip", "businessPhone"], render: () => (<>
      {text("companyName", "Company name", {}, "Shown to riders and drivers")}
      {text("legalName", "Legal business name")}
      {text("ein", "EIN / tax ID", { placeholder: "12-3456789" })}
      {text("street", "Business address")}
      <div className="grid grid-cols-[1fr_5rem_6rem] gap-3">{text("city", "City")}{text("state", "State", { maxLength: 2 })}{text("zip", "ZIP", { inputMode: "numeric" })}</div>
      {phoneField("businessPhone", "Business phone")}
    </>) },
    { id: "confirm", title: "Confirm and agree", description: "After approval you'll add vehicles with their registration and insurance, invite drivers and set driver pay.", fields: ["consent"], render: (f) => (<>
      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Document uploads and payout setup aren&apos;t available yet. Our verification team will contact you for business documents.</p>
      <div className="space-y-1">
        <div className="flex items-start gap-2"><Checkbox id="consent" checked={f.watch("consent")} onCheckedChange={(v) => f.setValue("consent", v === true, { shouldValidate: true })} /><Label htmlFor="consent" className="text-sm font-normal leading-snug">I am authorized to register this business and confirm the information is accurate.</Label></div>
        {e.consent && <p role="alert" className="text-xs text-destructive">{e.consent.message}</p>}
      </div>
    </>) },
    { id: "review", title: "Review and submit", fields: [], render: (f) => { const v = f.getValues(); return (
      <ReviewList rows={[["Your name", v.name], ["Email", v.email], ["Company", v.companyName], ["Legal name", v.legalName], ["EIN", v.ein], ["Address", `${v.street}, ${v.city}, ${v.state?.toUpperCase()} ${v.zip}`]]} />
    ); } },
  ];

  return <Wizard form={form} steps={steps} onSubmit={apply} submitLabel="Submit application" doneTitle="Company application submitted" doneText="Thanks! You're signed in. Once we verify your business you can add vehicles, invite drivers and set driver pay." />;
}
