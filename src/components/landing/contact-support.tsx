"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, LifeBuoy, Mail, Phone, ShieldCheck, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/common/contact-form";
import { BRAND } from "@/lib/config";
import { EASE, MaskLines, Reveal } from "./reveal";

const CHANNELS: { icon: LucideIcon; label: string; value: string; href: string; external?: boolean }[] = [
  { icon: Mail, label: "Email us", value: BRAND.supportEmail, href: `mailto:${BRAND.supportEmail}`, external: true },
  { icon: Phone, label: "Call us", value: BRAND.supportPhone, href: `tel:${BRAND.supportPhone.replace(/[^\d+]/g, "")}`, external: true },
  { icon: LifeBuoy, label: "Help center", value: "Answers on bookings, payments and partner onboarding", href: "/help" },
  { icon: ShieldCheck, label: "During a ride", value: "Reach support and report safety issues from your active booking", href: "/safety" },
];

export function ContactSupport() {
  return (
    <section className="border-t bg-background py-24 md:py-32">
      <div className="mx-auto max-w-site px-4">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">08 — Contact &amp; support</p>
            <h2 className="display text-4xl md:text-6xl">
              <MaskLines lines={["Need a hand?", <span key="b" className="text-muted-foreground">We&apos;re here.</span>]} />
            </h2>
          </div>
          <p className="max-w-lg text-muted-foreground">
            Questions about a booking, a payment, driving or your fleet? Reach the team directly or send us a message.
          </p>
        </div>

        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* channels */}
          <ul className="min-w-0 divide-y border-y">
            {CHANNELS.map((c, i) => {
              const inner = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <c.icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-muted-foreground">{c.label}</span>
                    <span className="mt-0.5 block text-base font-medium leading-snug md:truncate md:text-lg">{c.value}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground" />
                </>
              );
              const cls = "group flex items-center gap-4 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
              return (
                <motion.li
                  key={c.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                >
                  {c.external ? (
                    <a href={c.href} className={cls}>{inner}</a>
                  ) : (
                    <Link href={c.href} className={cls}>{inner}</Link>
                  )}
                </motion.li>
              );
            })}
          </ul>

          {/* form */}
          <Reveal delay={0.1} className="min-w-0">
            <p className="eyebrow mb-6 text-muted-foreground">Send us a message</p>
            <ContactForm idPrefix="home-" className="rounded-none border-0 bg-transparent p-0" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
