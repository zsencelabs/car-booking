import type { Metadata } from "next";
import { CategoryCard } from "@/components/common/category-card";
import { PageHero, Section } from "@/components/common/section";
import { VEHICLE_CATEGORIES } from "@/lib/mock/vehicle-categories";

export const metadata: Metadata = { title: "Vehicle categories" };

export default function Page() {
  return (
    <>
      <PageHero title="Vehicle categories" subtitle="Pick the category that suits your trip. Prices shown are sample estimates." />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_CATEGORIES.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </Section>
    </>
  );
}
