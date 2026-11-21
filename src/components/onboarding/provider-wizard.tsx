"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addYears, parseISO } from "date-fns";
import { z } from "zod";
import { DatePicker, formatDateLabel } from "@/components/common/date-picker";
import { FormField } from "@/components/common/field";
import { PhoneInput } from "@/components/common/phone-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROVIDER_DOCUMENTS } from "@/lib/mock/document-requirements";
import { phoneSchema } from "@/lib/phone";
import { FileDropzone } from "./file-dropzone";
import { ReviewList, Wizard, type WizardStep } from "./wizard";

const schema = z.object({
  legalName: z.string().trim().min(2, "Legal business name is required"),
  businessType: z.string().trim().min(2, "Business type is required"),
  ein: z.string().regex(/^\d{2}-?\d{7}$/, "Format: 12-3456789"),
  street: z.string().trim().min(3, "Business address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().regex(/^[A-Za-z]{2}$/, "2-letter state"),
  zip: z.string().regex(/^\d{5}$/, "5-digit ZIP"),
  businessEmail: z.string().email("Enter a valid email"),
  businessPhone: phoneSchema,
  docs: z.record(z.string(), z.string()),
  insurer: z.string().trim().min(2, "Insurance provider is required"),
  policyNumber: z.string().trim().min(4, "Policy number is required"),
  insuranceExpiry: z.string().min(1, "Expiry date is required").refine((v) => parseISO(v) > new Date(), "Policy must not be expired"),
  accountHolder: z.string().trim().min(2, "Account holder name is required"),
  repName: z.string().trim().min(2, "Representative name is required"),
  repTitle: z.string().trim().min(2, "Title is required"),
  repEmail: z.string().email("Enter a valid email"),
  repPhone: phoneSchema,
  consent: z.boolean().refine((v) => v, "Please confirm to continue"),
}).superRefine((v, ctx) => {
  PROVIDER_DOCUMENTS.filter((d) => d.required && !d.conditional).forEach((d) => {
    if (!v.docs[d.id]) ctx.addIssue({ code: "custom", path: ["docs", d.id], message: `${d.label} is required` });
  });
});
type Values = z.infer<typeof schema>;

export function ProviderWizard() {
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { insuranceExpiry: "", docs: {}, consent: false } });
  const reg = form.register;
  const e = form.formState.errors;
  const text = (id: keyof Values, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <FormField id={id} label={label} error={e[id] as never} hint={hint}><Input id={id} {...reg(id as never)} aria-invalid={!!e[id]} {...props} /></FormField>
  );

  const phoneField = (id: "businessPhone" | "repPhone", label: string) => (
    <FormField id={id} label={label} error={e[id] as never}>
      <Controller name={id} control={form.control} render={({ field }) => <PhoneInput id={id} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e[id]} />} />
    </FormField>
  );

  const steps: WizardStep<Values>[] = [
    { id: "company", title: "Company details", fields: ["legalName", "businessType", "ein", "street", "city", "state", "zip", "businessEmail", "businessPhone"], render: () => (<>
      {text("legalName", "Legal business name")}
      {text("businessType", "Business type", { placeholder: "e.g. LLC, Corporation, Sole proprietor" })}
      {text("ein", "EIN / tax ID", { placeholder: "12-3456789" })}
      {text("street", "Business address")}
      <div className="grid grid-cols-[1fr_5rem_6rem] gap-3">{text("city", "City")}{text("state", "State", { maxLength: 2 })}{text("zip", "ZIP", { inputMode: "numeric" })}</div>
      {text("businessEmail", "Business email", { type: "email" })}
      {phoneField("businessPhone", "Business phone")}
    </>) },
    { id: "documents", title: "Business documents", description: "Requirements depend on your business type and jurisdiction.", fields: ["docs"], render: (f) => (
      <div className="space-y-3">
        {PROVIDER_DOCUMENTS.map((d) => (
          <FileDropzone key={d.id} doc={d} value={f.watch(`docs.${d.id}`)} onChange={(n) => f.setValue(`docs.${d.id}`, n, { shouldValidate: true })} error={(e.docs as Record<string, { message?: string }> | undefined)?.[d.id]?.message} />
        ))}
      </div>
    ) },
    { id: "insurance", title: "Commercial insurance", description: "We track expiry dates and restrict vehicles automatically when coverage lapses.", fields: ["insurer", "policyNumber", "insuranceExpiry"], render: () => (<>
      {text("insurer", "Insurance provider")}{text("policyNumber", "Policy number")}<FormField id="insuranceExpiry" label="Expiration date" error={e.insuranceExpiry}><Controller name="insuranceExpiry" control={form.control} render={({ field }) => <DatePicker id="insuranceExpiry" placeholder="Select expiration date" min={addDays(new Date(), 1)} max={addYears(new Date(), 20)} rangeMessage="Policy must not be expired" value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!e.insuranceExpiry} />} /></FormField>
    </>) },
    { id: "payout", title: "Payout account", description: "You'll receive 80% of completed ride revenue, less adjustments.", fields: ["accountHolder"], render: () => (<>
      {text("accountHolder", "Account holder name")}
      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">Bank details are collected securely by our payment processor in the live product. Nothing is entered here.</p>
    </>) },
    { id: "rep", title: "Authorized representative", fields: ["repName", "repTitle", "repEmail", "repPhone", "consent"], render: (f) => (<>
      {text("repName", "Full name")}{text("repTitle", "Title")}{text("repEmail", "Email", { type: "email" })}{phoneField("repPhone", "Phone")}
      <div className="space-y-1">
        <div className="flex items-start gap-2"><Checkbox id="consent" checked={f.watch("consent")} onCheckedChange={(v) => f.setValue("consent", v === true, { shouldValidate: true })} /><Label htmlFor="consent" className="text-sm font-normal leading-snug">I am authorized to register this business and confirm the information is accurate.</Label></div>
        {e.consent && <p role="alert" className="text-xs text-destructive">{e.consent.message}</p>}
      </div>
    </>) },
    { id: "review", title: "Review and submit", fields: [], render: (f) => { const v = f.getValues(); return (
      <ReviewList rows={[["Business", v.legalName], ["Type", v.businessType], ["EIN", v.ein], ["Address", `${v.street}, ${v.city}, ${v.state?.toUpperCase()} ${v.zip}`], ["Documents uploaded", String(Object.keys(v.docs).length)], ["Insurance", `${v.insurer} · expires ${formatDateLabel(v.insuranceExpiry)}`], ["Representative", `${v.repName}, ${v.repTitle}`]]} />
    ); } },
  ];

  return <Wizard form={form} steps={steps} onSubmit={() => {}} submitLabel="Submit application" doneTitle="Company application submitted" doneText="Thanks! We'll verify your business and insurance documents. Once approved you can add vehicles, invite drivers and set driver compensation." />;
}
