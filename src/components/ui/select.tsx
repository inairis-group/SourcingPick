"use client";

import { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  /** Optional secondary text rendered muted next to the label. */
  description?: string;
  disabled?: boolean;
};

/**
 * Headless UI Listbox styled to match the rest of the design system.
 *
 * API-compatible with `<select name="..." defaultValue="..." required>`:
 * the selected value is shipped to the server through a hidden input, so
 * server actions reading `formData.get(name)` work without changes.
 *
 * Use this everywhere we'd otherwise reach for a native `<select>` — the
 * native control is platform-defaulted and breaks the visual rhythm of
 * the rest of our inputs.
 */
export function Select({
  name,
  options,
  defaultValue,
  value: controlled,
  onChange,
  placeholder,
  required,
  disabled,
  className,
  size = "md",
  inline = false,
}: {
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  /**
   * Render the options menu inside the trigger's wrapper (absolutely
   * positioned) instead of via Headless UI's anchored portal. The
   * portal mode is great for forms in the page but breaks inside
   * `<Dialog>` — the Dialog inerts its sibling subtree, killing
   * pointer events on the portaled options menu. Same workaround
   * the LocaleDropdown carries for its overlay mode.
   */
  inline?: boolean;
}) {
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const value = controlled ?? internal;
  const setValue = (next: string) => {
    if (controlled === undefined) setInternal(next);
    onChange?.(next);
  };

  const selected = options.find((o) => o.value === value);

  const sizing = size === "sm" ? "h-8 px-2.5 text-sm" : "h-10 px-3 text-base";

  return (
    <div className="relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      )}
      <Listbox value={value} onChange={setValue} disabled={disabled}>
        <ListboxButton
          className={cn(
            "relative w-full pe-9 text-start rounded-sm border bg-surface text-fg cursor-default",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
            "transition-colors duration-fast",
            sizing,
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <span
            className={cn(
              "block truncate",
              !selected && "text-faint",
            )}
          >
            {selected?.label ?? placeholder ?? ""}
          </span>
          <span className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-2">
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-faint"
            />
          </span>
        </ListboxButton>
        <ListboxOptions
          // `inline` skips Headless UI's portal so the menu lives
          // inside the trigger's wrapper. Required when the Select is
          // inside a Dialog — see prop doc.
          {...(inline ? {} : { anchor: { to: "bottom start", gap: 4 } })}
          transition
          className={cn(
            // Grow to fit the widest option, but never narrower than the
            // trigger and never wider than ~640px or the viewport.
            "z-popover min-w-(--button-width) w-max max-w-[min(90vw,640px)]",
            "max-h-72 overflow-auto",
            "rounded-md border border-line bg-surface shadow-lg",
            "focus:outline-none",
            "origin-top transition duration-100 ease-out",
            "data-closed:scale-95 data-closed:opacity-0",
            inline && [
              "absolute top-full mt-1 inset-s-0",
              "z-overlay-popover",
            ],
          )}
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                "relative flex items-start gap-2 px-3 py-2 text-sm cursor-default select-none",
                "data-focus:bg-subtle data-focus:text-headline",
                "data-disabled:opacity-50 data-disabled:cursor-not-allowed",
              )}
            >
              {({ selected: isSelected }) => (
                <>
                  <span className="flex-1 min-w-0">
                    <span
                      className={cn(
                        // Wrap long labels (incoterm explanations, country
                        // names) instead of clipping with an ellipsis.
                        "block wrap-break-word",
                        isSelected ? "font-medium text-headline" : "text-fg",
                      )}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="block text-xs text-muted mt-0.5 wrap-break-word">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={14}
                      strokeWidth={2}
                      className="text-action mt-0.5"
                    />
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
