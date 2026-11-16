"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "lucide-react";
import { MaskLines } from "./reveal";

export function FinalCta() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");

  return (
    <section className="dark relative isolate overflow-hidden bg-background py-28 text-foreground md:py-40">
      <svg aria-hidden viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute inset-0 -z-10 size-full opacity-60" fill="none">
        <motion.path
          d="M-20 330 C 200 330, 260 120, 480 140 S 760 320, 980 220 S 1160 60, 1240 80"
          className="stroke-primary/40" strokeWidth="2" strokeDasharray="6 10"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -160 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="display text-[clamp(3.5rem,12vw,9rem)]">
          <MaskLines lines={["Where to?"]} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-muted-foreground">Get an upfront estimate in seconds. You won&apos;t be charged until the ride is done.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = pickup.trim() ? `?pickup=${encodeURIComponent(pickup.trim())}` : "";
            router.push(`/book${q}`);
          }}
          className="mx-auto mt-10 flex max-w-lg items-center gap-2 rounded-full border bg-card p-1.5 pl-5 shadow-2xl shadow-black/40 focus-within:ring-2 focus-within:ring-ring/50"
        >
          <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor="cta-pickup" className="sr-only">Pickup address</label>
          <input
            id="cta-pickup"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Enter pickup address"
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <span className="hidden sm:inline">See prices</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            <span className="sr-only sm:hidden">See prices</span>
          </button>
        </form>
      </div>
    </section>
  );
}
