"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export function CountUp({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20, mass: 0.6 });
  const text = useTransform(spring, (v) => fmt.format(v));
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span className={className}>{text}</motion.span>;
}
