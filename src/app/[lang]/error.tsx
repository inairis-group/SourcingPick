"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/lib/i18n/client-provider";
import { Button, buttonClass } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/marketing/logo";
import { cn } from "@/lib/utils";

/**
 * Error boundary for the [lang] segment. Logs the digest to the console
 * for triage, but the user only sees the apology + recovery options.
 */
export default function LangError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDictionary();
  const pathname = usePathname();

  useEffect(() => {
    // Forwarding to an error tracker (Sentry / Hyperdx / etc.) lands in
    // the production hardening pass — for now we log so dev has a trace.
    console.error("Page error:", error);
  }, [error]);

  // First path segment is the locale.
  const lang = pathname?.split("/")[1] ?? "fr";

  return (
    <main className="min-h-dvh bg-page flex flex-col">
      <header className="px-6 py-5">
        <Link href={`/${lang}`} variant="muted">
          <Logo height={24} />
          <span className="sr-only">SourcingPick</span>
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center flex flex-col gap-4">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-danger">
            {dict.errors.systemError.code}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
            {dict.errors.systemError.title}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {dict.errors.systemError.body}
          </p>
          {error.digest && (
            <p className="text-[10px] text-faint font-mono mt-2">
              ref: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => reset()}
            >
              {dict.errors.systemError.retry}
            </Button>
            <Link
              href={`/${lang}`}
              className={cn(buttonClass({ variant: "secondary", size: "md" }))}
            >
              {dict.errors.notFound.home}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
