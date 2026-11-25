"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <main className="flex flex-1 items-center">
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="eyebrow mb-3">Something went wrong</p>
        <h1 className="text-3xl font-semibold tracking-tight">This page didn&apos;t load</h1>
        <p className="mt-3 text-muted-foreground">
          It may be a temporary problem. Try again, or go back to the home page.
        </p>
        {digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>Back to home</Link>
        </div>
      </div>
    </main>
  );
}
