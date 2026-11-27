"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvitation, addVehicle, assignVehicle, inviteDriver, setDriverPay, updateLicense, updatePricing, type Result } from "@/lib/dashboards/actions";
import type { PanelForm, PricingCategory } from "@/lib/dashboards/types";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

const card = "rounded-2xl bg-card p-5 ring-1 ring-foreground/5";
const selectClass = "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Runs a form's server action, shows the outcome and refreshes the dashboard. */
function useSubmit() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const [fields, setFields] = useState<Record<string, string>>({});
  function submit<T>(fn: () => Promise<Result<T>>, success: string, then?: (data?: T) => void) {
    setError(undefined);
    setFields({});
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error);
        setFields(res.fields ?? {});
        return;
      }
      toast.success(success);
      then?.(res.data);
      router.refresh();
    });
  }
  return { pending, error, fields, submit };
}

function Problem({ text }: { text?: string }) {
  return text ? <p role="alert" className="text-sm text-destructive">{text}</p> : null;
}

function InviteForm() {
  const { pending, error, submit } = useSubmit();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<{ token: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Invite a driver</h2>
      <p className="mt-1 text-sm text-muted-foreground">They sign up as a driver with this email, then enter the code under Fleets in their dashboard.</p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); submit(() => inviteDriver(email), "Invitation created", (d) => { if (d) setSent(d); setEmail(""); }); }}
      >
        <Label htmlFor="invite-email" className="sr-only">Driver&apos;s email</Label>
        <Input id="invite-email" type="email" required placeholder="driver@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 flex-1" />
        <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Send invitation</Button>
      </form>
      <Problem text={error} />
      {sent && (
        <div className="mt-4 space-y-2 rounded-xl bg-primary/10 p-4 text-sm">
          <p>Email sending isn&apos;t live yet, so pass this code to <strong>{sent.email}</strong>. It works once and expires in 7 days; we can&apos;t show it again.</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-background px-2.5 py-1.5 font-mono text-xs">{sent.token}</code>
            <Button
              type="button" size="sm" variant="outline"
              onClick={async () => { await navigator.clipboard.writeText(sent.token); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            >
              {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}{copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function InviteCodeForm() {
  const { pending, error, submit } = useSubmit();
  const [code, setCode] = useState("");
  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Join a fleet</h2>
      <p className="mt-1 text-sm text-muted-foreground">Enter the invitation code the fleet gave you. It must have been sent to the email you signed up with.</p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); submit(() => acceptInvitation(code), "You joined the fleet", () => setCode("")); }}>
        <Label htmlFor="invite-code" className="sr-only">Invitation code</Label>
        <Input id="invite-code" required autoComplete="off" placeholder="Invitation code" value={code} onChange={(e) => setCode(e.target.value)} className="h-9 flex-1 font-mono" />
        <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Join</Button>
      </form>
      <Problem text={error} />
    </section>
  );
}

function AssignForm({ vehicles, drivers }: { vehicles: { id: string; label: string }[]; drivers: { id: string; label: string }[] }) {
  const { pending, error, submit } = useSubmit();
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  if (!vehicles.length || !drivers.length) {
    return (
      <section className={card}>
        <h2 className="text-[15px] font-semibold tracking-tight">Assign a vehicle</h2>
        <p className="mt-1 text-sm text-muted-foreground">{!vehicles.length ? "Add a vehicle first." : "Invite a driver first."}</p>
      </section>
    );
  }
  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Assign a vehicle</h2>
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); submit(() => assignVehicle(vehicleId, driverId), "Vehicle assigned"); }}>
        <div className="space-y-1.5">
          <Label htmlFor="assign-vehicle">Vehicle</Label>
          <select id="assign-vehicle" required className={selectClass} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">Choose a vehicle</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assign-driver">Driver</Label>
          <select id="assign-driver" required className={selectClass} value={driverId} onChange={(e) => setDriverId(e.target.value)}>
            <option value="">Choose a driver</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
        <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Assign</Button>
      </form>
      <Problem text={error} />
    </section>
  );
}

function CompensationForm({ percent }: { percent: number | null }) {
  const { pending, error, submit } = useSubmit();
  const [value, setValue] = useState(percent === null ? "" : String(percent));
  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Default driver pay</h2>
      <p className="mt-1 text-sm text-muted-foreground">The share of your company&apos;s part of each fare (80% of the fare, before fees) that goes to the driver. Drivers see it as estimated pay on each job.</p>
      <form className="mt-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); submit(() => setDriverPay(Number(value)), "Driver pay updated"); }}>
        <div className="space-y-1.5">
          <Label htmlFor="pay-percent">Percent</Label>
          <div className="flex items-center gap-2">
            <Input id="pay-percent" type="number" inputMode="decimal" min={0} max={100} step={0.5} required value={value} onChange={(e) => setValue(e.target.value)} className="h-9 w-28" />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Save</Button>
      </form>
      <Problem text={error} />
    </section>
  );
}

const VEHICLE_FIELDS: { name: string; label: string; type?: string; placeholder?: string; span?: boolean; upper?: boolean }[] = [
  { name: "make", label: "Make", placeholder: "Toyota" },
  { name: "model", label: "Model", placeholder: "Camry" },
  { name: "year", label: "Year", type: "number" },
  { name: "color", label: "Color", placeholder: "Black" },
  { name: "vin", label: "VIN", placeholder: "17 characters", span: true, upper: true },
  { name: "licensePlate", label: "License plate", upper: true },
  { name: "registrationState", label: "Registration state", placeholder: "DC", upper: true },
  { name: "registrationExpiresAt", label: "Registration expires", type: "date" },
  { name: "passengerCapacity", label: "Passenger seats", type: "number" },
  { name: "luggageCapacity", label: "Luggage (bags)", type: "number" },
  { name: "insuranceProvider", label: "Insurance company" },
  { name: "insurancePolicyNumber", label: "Policy number" },
  { name: "insuranceExpiresAt", label: "Insurance expires", type: "date" },
];

function VehicleForm({ categories }: { categories: { id: string; name: string; passengers: number }[] }) {
  const { pending, error, fields, submit } = useSubmit();
  const [formKey, setFormKey] = useState(0);

  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Vehicle details</h2>
      <form
        key={formKey}
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
          submit(() => addVehicle(values), "Vehicle added and sent for review", () => setFormKey((k) => k + 1));
        }}
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="v-categoryId">Vehicle class</Label>
          <select id="v-categoryId" name="categoryId" required className={selectClass} defaultValue="">
            <option value="" disabled>Choose a class</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name} (up to {c.passengers} riders)</option>)}
          </select>
          {fields.categoryId && <p className="text-xs text-destructive">{fields.categoryId}</p>}
        </div>
        {VEHICLE_FIELDS.map((f) => (
          <div key={f.name} className={cn("space-y-1.5", f.span && "sm:col-span-2")}>
            <Label htmlFor={`v-${f.name}`}>{f.label}</Label>
            <Input
              id={`v-${f.name}`} name={f.name} type={f.type ?? "text"} required placeholder={f.placeholder}
              aria-invalid={!!fields[f.name]} className={cn("h-9", f.upper && "uppercase")}
              {...(f.name === "year" ? { min: 1990, max: new Date().getFullYear() + 1 } : {})}
              {...(f.name.endsWith("Capacity") ? { min: f.name.startsWith("luggage") ? 0 : 1, max: 16 } : {})}
            />
            {fields[f.name] && <p className="text-xs text-destructive">{fields[f.name]}</p>}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Add vehicle</Button>
          <Problem text={error} />
        </div>
      </form>
    </section>
  );
}

function LicenseForm({ licenseNumber, licenseState, licenseExpiresAt }: { licenseNumber: string; licenseState: string; licenseExpiresAt: string }) {
  const { pending, error, fields, submit } = useSubmit();
  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold tracking-tight">Driver&apos;s license</h2>
      <p className="mt-1 text-sm text-muted-foreground">Changing these after a decision sends your profile back for review.</p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_6rem_11rem_auto] sm:items-end"
        onSubmit={(e) => { e.preventDefault(); submit(() => updateLicense(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>), "License details saved"); }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="l-number">License number</Label>
          <Input id="l-number" name="licenseNumber" required defaultValue={licenseNumber} aria-invalid={!!fields.licenseNumber} className="h-9" />
          {fields.licenseNumber && <p className="text-xs text-destructive">{fields.licenseNumber}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-state">State</Label>
          <Input id="l-state" name="licenseState" required maxLength={2} defaultValue={licenseState} aria-invalid={!!fields.licenseState} className="h-9 uppercase" />
          {fields.licenseState && <p className="text-xs text-destructive">{fields.licenseState}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-expires">Expires</Label>
          <Input id="l-expires" name="licenseExpiresAt" type="date" required defaultValue={licenseExpiresAt} aria-invalid={!!fields.licenseExpiresAt} className="h-9" />
          {fields.licenseExpiresAt && <p className="text-xs text-destructive">{fields.licenseExpiresAt}</p>}
        </div>
        <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Save</Button>
      </form>
      <Problem text={error} />
    </section>
  );
}

/** Matches the API: each band is this many km wide. */
const BAND_KM = 50;
const EXAMPLE_KM = 120;
const toDollars = (cents: number) => (cents / 100).toFixed(2);
const toCents = (v: string) => Math.round((Number(v) || 0) * 100);

/** Same rule as the API: each 50 km band at its own rate; the last rate applies beyond. */
function exampleFareCents(base: number, minimum: number, bands: number[], km: number) {
  let total = base;
  for (let i = 0, from = 0; from < km; i++, from += BAND_KM) {
    const last = i >= bands.length - 1;
    total += bands[Math.min(i, bands.length - 1)] * (last ? km - from : Math.min(BAND_KM, km - from));
    if (last) break;
  }
  return Math.max(Math.round(total), minimum);
}

function PricingCard({ category }: { category: PricingCategory }) {
  const { pending, error, submit } = useSubmit();
  const [baseFare, setBaseFare] = useState(toDollars(category.baseFareCents));
  const [minimumFare, setMinimumFare] = useState(toDollars(category.minimumFareCents));
  const [bands, setBands] = useState(category.perKmBandCents.map(toDollars));
  const example = exampleFareCents(toCents(baseFare), toCents(minimumFare), bands.map(toCents), EXAMPLE_KM);
  const field = `${category.id}-`;

  return (
    <section className={card}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight">{category.name}</h2>
        {!category.active && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hidden from riders</span>}
      </div>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => { e.preventDefault(); submit(() => updatePricing(category.id, { baseFare, minimumFare, bands }), `${category.name} prices saved`); }}
      >
        <div className="grid grid-cols-2 gap-3">
          <MoneyInput id={`${field}base`} label="Base fare" value={baseFare} onChange={setBaseFare} max={500} />
          <MoneyInput id={`${field}min`} label="Minimum fare" value={minimumFare} onChange={setMinimumFare} max={500} />
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Rate per km</legend>
          {bands.map((v, i) => {
            const last = i === bands.length - 1;
            return (
              <div key={i} className="grid grid-cols-[8.5rem_1fr] items-center gap-3">
                <Label htmlFor={`${field}band-${i}`} className="font-mono text-xs text-muted-foreground">
                  {i * BAND_KM}–{last ? "∞" : (i + 1) * BAND_KM} km
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    id={`${field}band-${i}`} type="number" inputMode="decimal" min={0} max={20} step={0.01} required value={v}
                    onChange={(e) => setBands((b) => b.map((x, j) => (j === i ? e.target.value : x)))}
                    className="h-9 w-28"
                  />
                  <span className="text-sm text-muted-foreground">/km</span>
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" disabled={bands.length >= 20} onClick={() => setBands((b) => [...b, b[b.length - 1]])}>
              <Plus aria-hidden className="size-3.5" />Add band
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={bands.length <= 1} onClick={() => setBands((b) => b.slice(0, -1))}>
              <Minus aria-hidden className="size-3.5" />Remove last band
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The last rate applies to every km beyond {(bands.length - 1) * BAND_KM} km.
          </p>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            A {EXAMPLE_KM} km one-way ride: <span className="font-medium text-foreground">{money(example)}</span>
          </p>
          <Button type="submit" disabled={pending}>{pending && <Loader2 aria-hidden className="size-4 animate-spin" />}Save</Button>
        </div>
        <Problem text={error} />
      </form>
    </section>
  );
}

function MoneyInput({ id, label, value, onChange, max }: { id: string; label: string; value: string; onChange: (v: string) => void; max: number }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">$</span>
        <Input id={id} type="number" inputMode="decimal" min={0} max={max} step={0.01} required value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
      </div>
    </div>
  );
}

function PricingForm({ categories }: { categories: PricingCategory[] }) {
  if (!categories.length) return <section className={card}><p className="text-sm text-muted-foreground">No vehicle classes yet.</p></section>;
  return <div className="grid gap-5 lg:grid-cols-2">{categories.map((c) => <PricingCard key={c.id} category={c} />)}</div>;
}

export function PanelForms({ forms }: { forms: PanelForm[] }) {
  return (
    <div className="space-y-5">
      {forms.map((f) => {
        switch (f.type) {
          case "invite": return <InviteForm key="invite" />;
          case "invite-code": return <InviteCodeForm key="invite-code" />;
          case "assign": return <AssignForm key="assign" vehicles={f.vehicles} drivers={f.drivers} />;
          case "compensation": return <CompensationForm key="compensation" percent={f.percent} />;
          case "vehicle": return <VehicleForm key="vehicle" categories={f.categories} />;
          case "pricing": return <PricingForm key="pricing" categories={f.categories} />;
          case "license": return <LicenseForm key="license" licenseNumber={f.licenseNumber} licenseState={f.licenseState} licenseExpiresAt={f.licenseExpiresAt} />;
        }
      })}
    </div>
  );
}
