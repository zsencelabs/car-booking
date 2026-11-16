"use client";

import { useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface WizardStep<T extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  /** Fields validated before moving on. */
  fields: Path<T>[];
  render: (form: UseFormReturn<T>) => React.ReactNode;
}

export function Wizard<T extends FieldValues>({ form, steps, onSubmit, submitLabel, doneTitle, doneText }: {
  form: UseFormReturn<T>; steps: WizardStep<T>[]; onSubmit: () => void; submitLabel: string; doneTitle: string; doneText: string;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const step = steps[i];
  const last = i === steps.length - 1;

  async function next() {
    if (await form.trigger(step.fields)) setI((n) => n + 1);
  }

  if (done) {
    return (
      <div role="status" className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
        <h2 className="text-2xl font-semibold">{doneTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{doneText}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(() => { onSubmit(); setDone(true); })}
      className="space-y-6 rounded-2xl border bg-card p-6"
    >
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground"><span>Step {i + 1} of {steps.length}</span><span>{step.title}</span></div>
        <Progress value={((i + 1) / steps.length) * 100} aria-label="Application progress" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">{step.title}</h2>
        {step.description && <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>}
      </div>
      <div className="space-y-4">{step.render(form)}</div>
      <div className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" size="lg" className="h-10 px-4" onClick={() => setI((n) => n - 1)} disabled={i === 0}><ArrowLeft className="size-4" />Back</Button>
        {last
          ? <Button type="submit" size="lg" className="h-10 px-4">{submitLabel}</Button>
          : <Button type="button" size="lg" className="h-10 px-4" onClick={next}>Continue<ArrowRight className="size-4" /></Button>}
      </div>
    </form>
  );
}

export function ReviewList({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="divide-y rounded-xl border text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 px-4 py-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v || "—"}</dd></div>
      ))}
    </dl>
  );
}
