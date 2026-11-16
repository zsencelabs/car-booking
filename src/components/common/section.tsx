import { cn } from "@/lib/utils";

export function Section({
  title, subtitle, children, className, muted,
}: {
  title?: string; subtitle?: string; children: React.ReactNode; className?: string; muted?: boolean;
}) {
  return (
    <section className={cn("py-16 md:py-20", muted && "bg-muted/40", className)}>
      <div className="mx-auto max-w-site px-4">
        {(title || subtitle) && (
          <div className="mb-10 max-w-2xl">
            {title && <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>}
            {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b bg-muted/40">
      <div className="mx-auto max-w-site px-4 py-14">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
