"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { MotionProvider } from "@/components/landing/motion-provider";
import { EASE, MaskLines } from "@/components/landing/reveal";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const FACTS = {
  rider: [
    { k: "$0", v: "charged before drop-off" },
    { k: "100%", v: "of tips go to your driver" },
    { k: "6", v: "vehicle classes, economy to van" },
  ],
  driver: [
    { k: "6", v: "short steps to apply" },
    { k: "100%", v: "of tips go to you" },
    { k: "6", v: "vehicle classes, economy to van" },
  ],
  fleet: [
    { k: "80%", v: "of completed ride revenue, before fees and adjustments" },
    { k: "4", v: "short steps to apply" },
    { k: "6", v: "vehicle classes, economy to van" },
  ],
} as const;

function RouteLine() {
  return (
    <div aria-hidden className="flex items-center gap-3">
      <span className="size-2.5 shrink-0 rounded-full border-2 border-foreground" />
      <span className="relative h-px flex-1 bg-border">
        <motion.span
          className="absolute inset-0 origin-left bg-primary motion-reduce:hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
        />
        <motion.span
          className="absolute -top-1 -ml-1 size-2 rounded-full bg-primary shadow-[0_0_14px_var(--primary)] motion-reduce:hidden"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.8 }}
        />
      </span>
      <span className="size-2.5 shrink-0 rounded-[3px] bg-foreground" />
    </div>
  );
}

export function AuthShell({ eyebrow, headline, accent, text, variant = "rider", title, subtitle, wide, children }: {
  eyebrow: string;
  headline: string;
  accent: string;
  text: string;
  variant?: keyof typeof FACTS;
  title?: string;
  subtitle?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
        {/* brand panel */}
        <div className="dark relative isolate shrink-0 overflow-hidden bg-background text-foreground lg:sticky lg:top-0 lg:h-screen lg:w-[45%]">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_30%_0%,color-mix(in_oklch,var(--foreground)_10%,transparent),transparent_70%)]" />
            <div className="grain absolute inset-0 opacity-[0.06]" />
          </div>

          <div className="flex h-full flex-col gap-8 p-6 lg:justify-between lg:p-10 xl:p-14">
            <Logo />

            <div>
              <p className="eyebrow mb-4 inline-flex items-center gap-3 lg:mb-6">
                <span className="h-px w-8 bg-primary" />
                {eyebrow}
              </p>
              <h1 className="display text-[clamp(2.25rem,4vw,4.5rem)]">
                <MaskLines lines={[headline, <span key="a" className="text-primary">{accent}</span>]} />
              </h1>
              <motion.p
                className="mt-6 hidden max-w-md leading-relaxed text-muted-foreground lg:block"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              >
                {text}
              </motion.p>
            </div>

            <motion.div
              className="hidden space-y-7 lg:block"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.55 }}
            >
              <RouteLine />
              <dl className="grid grid-cols-3 divide-x">
                {FACTS[variant].map((f, i) => (
                  <div key={f.v} className={cn("px-4", i === 0 && "pl-0")}>
                    <dt className="text-2xl font-semibold tracking-tight xl:text-3xl">{f.k}</dt>
                    <dd className="mt-1 text-xs leading-snug text-muted-foreground">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>

        {/* form panel */}
        <main className="flex min-w-0 flex-1 flex-col bg-background">
          <div className="px-6 py-4 lg:px-10 lg:py-6">
            <Link href="/" className="group inline-flex h-10 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Back to site
            </Link>
          </div>

          <motion.div
            className={cn("mx-auto my-auto w-full px-6 pb-14 pt-4 lg:pb-16", wide ? "max-w-2xl" : "max-w-120")}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            {title && (
              <div className="mb-8">
                <h2 className="display text-3xl md:text-4xl">{title}</h2>
                {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
              </div>
            )}
            {children}
          </motion.div>
        </main>
      </div>
    </MotionProvider>
  );
}
