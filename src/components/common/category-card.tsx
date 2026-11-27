import Image from "next/image";
import { Briefcase, Users } from "lucide-react";
import { usd } from "@/lib/format";
import type { VehicleCategory } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className }: { category: VehicleCategory; className?: string }) {
  return (
    <div className={cn("group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md", className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={category.image} alt={`${category.name} class: ${category.imageAlt.toLowerCase()}`} fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <a
          href={`https://unsplash.com/@${category.photoCredit.username}?utm_source=dropoff&utm_medium=referral`}
          target="_blank" rel="noopener noreferrer"
          className="absolute bottom-2 right-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur hover:text-white"
        >
          Photo: {category.photoCredit.name} / Unsplash
        </a>
      </div>
      <div className="p-5">
      <h3 className="text-lg font-semibold">{category.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      <p className="mt-2 text-xs text-muted-foreground">e.g. {category.examples}</p>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="size-4" />{category.passengers}</span>
        <span className="flex items-center gap-1"><Briefcase className="size-4" />{category.luggage}</span>
        <span className="ml-auto font-medium text-foreground">base {usd(category.baseFare)}</span>
      </div>
      </div>
    </div>
  );
}
