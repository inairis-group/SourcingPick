"use client";

import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { useLocale } from "@/lib/i18n/client-provider";
import { countriesFor, countryNameFor } from "@/lib/countries";
import { cn } from "@/lib/utils";

/**
 * Typeahead country picker backed by ISO 3166-1.
 *
 * Stores the alpha-2 code via a hidden input (so `formData.get(name)` reads
 * "FR", "CN", etc.). The display query filters by both code and localised
 * name — typing "fra" or "FR" both surface France.
 *
 * API-compatible with the existing `<Input name="country" value=... />`
 * pattern (controlled via `value` + `onChange` returning the code).
 */
export function CountrySelect({
  name,
  value,
  onChange,
  defaultValue,
  required,
  disabled,
  placeholder,
  invalid,
  autoFocus,
}: {
  name?: string;
  value?: string;
  onChange?: (code: string) => void;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const locale = useLocale();
  const options = useMemo(() => countriesFor(locale), [locale]);

  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const code = value ?? internal;
  const [query, setQuery] = useState("");

  const setCode = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? options
      .filter(
        (c) =>
          c.name.toLowerCase().includes(normalized) ||
          c.code.toLowerCase().startsWith(normalized),
      )
      .slice(0, 50)
    : options.slice(0, 50);

  const selectedName = code ? countryNameFor(code, locale) : "";

  return (
    <div className="relative">
      {name && (
        <input
          type="hidden"
          name={name}
          value={code}
          required={required}
        />
      )}
      <Combobox value={code} onChange={(v) => setCode(v ?? "")} disabled={disabled}>
        <div
          className={cn(
            "relative w-full rounded-sm border bg-surface transition-colors duration-fast",
            "focus-within:border-focus focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2",
            invalid ? "border-danger" : "border-line-strong",
            disabled && "bg-subtle cursor-not-allowed opacity-60",
          )}
        >
          <ComboboxInput
            autoComplete="country-name"
            autoFocus={autoFocus}
            displayValue={() => selectedName}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full h-10 ps-3 pe-9 text-base rounded-sm bg-transparent text-fg placeholder:text-faint",
              "outline-none",
            )}
          />
          <ComboboxButton
            className="absolute inset-y-0 inset-e-0 flex items-center pe-2 text-faint"
            aria-label="Toggle country list"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.5}
            />
          </ComboboxButton>
        </div>
        <ComboboxOptions
          anchor={{ to: "bottom start", gap: 4 }}
          transition
          className={cn(
            "z-popover w-(--input-width) max-h-72 overflow-auto",
            "rounded-md border border-line bg-surface shadow-lg",
            "focus:outline-none",
            "origin-top transition duration-100 ease-out",
            "data-closed:scale-95 data-closed:opacity-0",
          )}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-faint">—</div>
          ) : (
            filtered.map((option) => (
              <ComboboxOption
                key={option.code}
                value={option.code}
                className={cn(
                  "relative flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-default select-none",
                  "data-focus:bg-subtle data-focus:text-headline",
                )}
              >
                {({ selected }) => (
                  <>
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "block truncate",
                          selected ? "font-medium text-headline" : "text-fg",
                        )}
                      >
                        {option.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wide text-faint">
                        {option.code}
                      </span>
                    </span>
                    {selected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={14}
                        strokeWidth={2}
                        className="text-action"
                      />
                    )}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
