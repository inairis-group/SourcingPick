import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import { WHATSAPP_URL } from "@/lib/contact/whatsapp";
import { cn } from "@/lib/utils";

/**
 * A round WhatsApp button on every public page, opening a chat with the team
 * in WhatsApp (a new tab on a computer, the app on a phone).
 *
 * It sits in the same corner as the live chat and, when that button is shown
 * (no account yet), directly above it: 56px button + 16px gap over the chat's
 * own 16px inset. It is one layer below the chat (sticky, not popover), so the
 * chat panel, which opens upwards, covers it rather than the reverse.
 *
 * WhatsApp's green, because the colour is how the button is recognised.
 */
export function WhatsAppButton({ label, aboveChat }: { label: string; aboveChat: boolean }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "fixed inset-e-4 z-sticky inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5A]",
        "duration-fast transition-transform active:scale-95",
        "focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        aboveChat ? "bottom-[5.5rem]" : "bottom-4",
      )}
    >
      <HugeiconsIcon icon={WhatsappIcon} size={26} strokeWidth={1.6} />
    </a>
  );
}
