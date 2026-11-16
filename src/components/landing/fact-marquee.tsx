export function FactMarquee({ facts }: { facts: readonly string[] }) {
  const row = [...facts, ...facts];
  return (
    <div className="dark border-y bg-background text-foreground">
      <p className="sr-only">{facts.join(". ")}</p>
      <div aria-hidden className="group relative overflow-hidden py-5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((f, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-mono text-sm text-muted-foreground">
              {f}
              <span className="size-1.5 rotate-45 bg-primary" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
