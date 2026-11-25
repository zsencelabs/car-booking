import { Briefcase, CarFront, Users } from "lucide-react";
import { usd } from "@/lib/format";
import type { VehicleCategory } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className }: { category: VehicleCategory; className?: string }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md", className)}>
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-brand-ink">
        <CarFront className="size-6" />
      </div>
      <h3 className="text-lg font-semibold">{category.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      <p className="mt-2 text-xs text-muted-foreground">e.g. {category.examples}</p>
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Users className="size-4" />{category.passengers}</span>
        <span className="flex items-center gap-1"><Briefcase className="size-4" />{category.luggage}</span>
        <span className="ml-auto font-medium text-foreground">base {usd(category.baseFare)}</span>
      </div>
    </div>
  );
}
