"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelFreightQuote } from "@/lib/freight-quotes/actions";
import { Button } from "@/components/ui/button";

/** Withdraw a quote the client has not answered yet. */
export function CancelFreightQuote({ id, label, confirm }: { id: string; label: string; confirm: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirm)) return;
        startTransition(async () => {
          await cancelFreightQuote(id);
          router.refresh();
        });
      }}
    >
      {label}
    </Button>
  );
}
