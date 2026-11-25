"use client";

import Link from "next/link";
import { useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/components/landing/reveal";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WizardStep<T extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  /** Fields validated before moving on. */
  fields: Path<T>[];
  render: (form: UseFormReturn<T>) => React.ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** What submitting returns: where to go next, or an error (with optional field errors). */
export type WizardResult = { ok: true; path: string } | { ok: false; error: string; fields?: Record<string, string> };

export function Wizard<T extends FieldValues>({ form, steps, onSubmit, submitLabel, doneTitle, doneText }: {
  form: UseFormReturn<T>; steps: WizardStep<T>[]; onSubmit: (values: T) => Promise<WizardResult>; submitLabel: string; doneTitle: string; doneText: string;
}) {
  const [i, setI] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const step = steps[i];
  const last = i === steps.length - 1;
  const submitting = form.formState.isSubmitting;

  async function next() {
    if (await form.trigger(step.fields)) setI((n) => n + 1);
  }

  async function submit(values: T) {
    setError(undefined);
    const res = await onSubmit(values);
    if (res.ok) return setDone(res.path);
    // Send the person back to the first step with a field the server rejected.
    const bad = Object.keys(res.fields ?? {});
    for (const k of bad) form.setError(k as Path<T>, { message: res.fields![k] });
    const at = steps.findIndex((s) => s.fields.some((f) => bad.includes(f)));
    if (at >= 0) setI(at);
    setError(res.error);
  }

  if (done) return <SuccessScreen title={doneTitle} text={doneText} href={done} />;

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)}>
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between gap-4">
          <span className="eyebrow">Step {pad(i + 1)} / {pad(steps.length)}</span>
          <span className="truncate text-xs text-muted-foreground">{step.title}</span>
        </div>
        <div role="progressbar" aria-label="Application progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} className="flex gap-1.5">
          {steps.map((s, k) => (
            <span key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.span
                className="block h-full origin-left rounded-full bg-primary"
                initial={false}
                animate={{ scaleX: k <= i ? 1 : 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              />
            </span>
          ))}
        </div>
      </div>

      <motion.div
        key={step.id}
        initial={i === 0 ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h2 className="display text-3xl md:text-4xl">{step.title}</h2>
        {step.description && <p className="mt-3 text-muted-foreground">{step.description}</p>}
        <div className="mt-8 space-y-5">{step.render(form)}</div>
      </motion.div>

      {error && <p role="alert" className="mt-8 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="mt-10 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="lg" className="h-12 rounded-full px-5" onClick={() => setI((n) => n - 1)} disabled={i === 0 || submitting}>
          <ArrowLeft className="size-4" />Back
        </Button>
        {last
          ? <Button key="submit" type="submit" size="lg" disabled={submitting} className="h-12 rounded-full px-7 text-[15px]">{submitting && <Loader2 aria-hidden className="size-4 animate-spin" />}{submitting ? "Submitting..." : submitLabel}</Button>
          : <Button key="next" type="button" size="lg" className="h-12 rounded-full px-7 text-[15px]" onClick={next}>Continue<ArrowRight className="size-4" /></Button>}
      </div>
    </form>
  );
}

const BURST = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const distance = i % 2 ? 104 : 80;
  return {
    x: Math.round(Math.cos(angle) * distance),
    y: Math.round(Math.sin(angle) * distance),
    size: [8, 5, 3][i % 3],
    square: i % 4 === 0,
    delay: (i % 3) * 0.035,
  };
});

function SuccessScreen({ title, text, href }: { title: string; text: string; href: string }) {
  const reduce = !!useReducedMotion();
  const from = <T,>(value: T) => (reduce ? false : value);

  return (
    <div role="status" className="flex flex-col items-center py-10 text-center">
      <div aria-hidden className="relative mb-9 grid size-44 place-items-center">
        {!reduce && [0, 0.18].map((delay) => (
          <motion.span
            key={delay}
            className="absolute inset-5 rounded-full border border-primary"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.45, opacity: [0, 0.7, 0] }}
            transition={{ duration: 1.1, delay: 0.72 + delay, ease: EASE }}
          />
        ))}

        {!reduce && BURST.map((p, i) => (
          <motion.span
            key={i}
            className={cn("absolute left-1/2 top-1/2 bg-primary", p.square ? "rounded-xs" : "rounded-full")}
            style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1, 0.4], opacity: [0, 1, 0], rotate: p.square ? 160 : 0 }}
            transition={{ duration: 1, delay: 0.74 + p.delay, ease: EASE }}
          />
        ))}

        <svg viewBox="0 0 96 96" className="relative size-28 overflow-visible">
          <motion.circle
            cx="48" cy="48" r="45" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"
            className="origin-center -rotate-90 transform-fill"
            initial={from({ pathLength: 0, opacity: 0 })}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
          <motion.circle
            cx="48" cy="48" r="39" fill="var(--primary)"
            className="origin-center transform-fill"
            initial={from({ scale: 0 })}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 17, delay: 0.55 }}
          />
          <motion.path
            d="M31 49.5 43.5 62 66 36" fill="none" stroke="var(--primary-foreground)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            initial={from({ pathLength: 0, opacity: 0 })}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.82, ease: "easeOut" }}
          />
        </svg>
      </div>

      <h2 className="display text-4xl md:text-5xl">
        <span className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            initial={from({ y: "110%" })}
            animate={{ y: "0%" }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          >
            {title}
          </motion.span>
        </span>
      </h2>
      <motion.p
        className="mx-auto mt-5 max-w-md leading-relaxed text-muted-foreground"
        initial={from({ opacity: 0, y: 14 })}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
      >
        {text}
      </motion.p>
      <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 rounded-full px-7")}>Go to your dashboard</Link>
    </div>
  );
}

export function ReviewList({ rows }: { rows: [string, string | undefined][] }) {
  return (
    <dl className="divide-y border-y text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-3.5"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v || "—"}</dd></div>
      ))}
    </dl>
  );
}
