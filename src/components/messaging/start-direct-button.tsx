"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { openOrCreateDirectThreadAction } from "@/lib/messaging/direct-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";

/**
 * One-click "message this user" button — partner #30. Opens (or lazy-
 * creates) a 1:1 DIRECT thread between the caller and the target user,
 * then redirects to that thread's deep-link via /messages?dm={id}.
 *
 * Surface this anywhere a person's identity is on screen and a
 * message-action makes sense: admin user detail, factory profile,
 * agent profile, client org page, etc.
 */
export function StartDirectButton({
  otherUserId,
  label,
  variant = "secondary",
}: {
  otherUserId: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const dict = useDictionary();
  const lang = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const open = () => {
    setPending(true);
    startTransition(async () => {
      const r = await openOrCreateDirectThreadAction(otherUserId);
      setPending(false);
      if (!r.ok) {
        alert(r.error);
        return;
      }
      router.push(`/${lang}/messages?dm=${r.threadId}`);
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={open}
      loading={pending}
    >
      <HugeiconsIcon icon={Message01Icon} size={14} strokeWidth={1.75} />
      <span className="ms-1.5">
        {label ?? dict.messaging.directOpenCta}
      </span>
    </Button>
  );
}
