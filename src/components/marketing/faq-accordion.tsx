"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export type FaqItem = { question: string; answer: string };

/**
 * Accessible FAQ accordion. Controlled (single-open) with a chevron that
 * rotates and a grid-rows height transition — matches the platform's
 * motion vocabulary (duration/ease tokens) without measuring heights in
 * JS. `prefers-reduced-motion` is honoured by the global CSS rule.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="flex flex-col divide-y divide-line-subtle border-y border-line-subtle">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-5 text-start group"
            >
              <span
                className={cn(
                  "text-base font-medium transition-colors duration-fast",
                  isOpen ? "text-headline" : "text-fg group-hover:text-headline",
                )}
              >
                {item.question}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                size={18}
                strokeWidth={1.75}
                className={cn(
                  "shrink-0 text-muted transition-transform duration-base ease-default",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-base ease-default",
                isOpen
                  ? "grid-rows-[1fr] opacity-100 pb-5"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-muted leading-relaxed max-w-2xl">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
