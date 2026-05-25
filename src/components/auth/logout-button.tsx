"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { logoutAction } from "@/lib/auth/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "icon" | "labelled";
  className?: string;
};

/**
 * Logout trigger — wraps the logout Server Action in a form so it works
 * without JS. Renders as either a labelled button (default) or an icon-only
 * button (for tight dashboard headers).
 */
export function LogoutButton({ variant = "labelled", className }: Props) {
  const dict = useDictionary();

  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex items-center gap-2 rounded-full text-sm font-medium text-muted hover:text-fg transition-colors duration-fast",
          variant === "labelled" && "h-9 px-3 hover:bg-ghost-hover",
          variant === "icon" && "h-9 w-9 justify-center hover:bg-ghost-hover",
          className,
        )}
      >
        <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.5} />
        {variant === "labelled" && <span>{dict.nav.logout}</span>}
      </button>
    </form>
  );
}
