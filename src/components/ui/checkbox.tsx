"use client";

import { Checkbox as HUICheckbox, type CheckboxProps as HUIProps } from "@headlessui/react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = Omit<HUIProps, "as" | "children"> & {
  label?: ReactNode;
  className?: string;
};

export const Checkbox = forwardRef<HTMLElement, CheckboxProps>(function Checkbox(
  { label, className, ...rest },
  ref,
) {
  const box = (
    <HUICheckbox
      ref={ref as never}
      className={cn(
        "group flex items-center justify-center size-5 rounded-sm border bg-surface",
        "border-line-strong data-checked:bg-action data-checked:border-action",
        "transition-colors duration-fast",
        "data-focus:outline-2 data-focus:outline-focus data-focus:outline-offset-2",
        "data-disabled:bg-subtle data-disabled:cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      <svg
        viewBox="0 0 14 14"
        fill="none"
        className="size-3.5 stroke-on-action opacity-0 group-data-checked:opacity-100 transition-opacity duration-fast"
        aria-hidden
      >
        <path d="M3 7l3 3 5-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </HUICheckbox>
  );

  if (!label) return box;

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      {box}
      <span className="text-sm text-fg">{label}</span>
    </label>
  );
});
