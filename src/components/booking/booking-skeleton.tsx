export function BookingSkeleton() {
  return (
    <div className="mx-auto max-w-site animate-pulse space-y-8 px-4 py-10" aria-busy="true" aria-label="Loading">
      <div className="h-7 rounded-full bg-muted" />
      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="h-96 rounded-2xl bg-muted" />
        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
