"use client";

import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type PinInputProps = {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  name?: string;
  ariaLabel?: string;
};

/**
 * Pin input for email-OTP entry.
 *
 * Behaviour:
 *  - Auto-advances on digit entry
 *  - Backspace clears the current cell, or moves back if already empty
 *  - Arrow keys navigate without changing values
 *  - Pasting a full code splits across cells regardless of where you paste
 *  - Mobile inputmode="numeric" + pattern triggers the right keypad
 *
 * Emits onComplete when every cell has a digit. Validation happens on the server.
 */
export function PinInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
  autoFocus,
  name,
  ariaLabel = "Verification code",
}: PinInputProps) {
  const [internal, setInternal] = useState<string[]>(() =>
    splitValue(value ?? "", length),
  );
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const cells = value !== undefined ? splitValue(value, length) : internal;

  const update = (next: string[]) => {
    if (value === undefined) setInternal(next);
    const joined = next.join("");
    onChange?.(joined);
    if (joined.length === length && !next.includes("")) onComplete?.(joined);
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...cells];
    next[index] = digit;
    update(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[index]) {
        const next = [...cells];
        next[index] = "";
        update(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = [...cells];
        next[index - 1] = "";
        update(next);
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = splitValue(text, length);
    update(next);
    const lastFilled = Math.min(text.length, length) - 1;
    refs.current[Math.min(lastFilled + 1, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label={ariaLabel}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={cells[i] ?? ""}
          aria-invalid={invalid || undefined}
          aria-label={`${ariaLabel} ${i + 1} of ${length}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-10 text-center font-mono text-xl font-semibold rounded-md border bg-surface text-fg",
            "transition-colors duration-fast",
            "focus:outline-2 focus:outline-focus focus:outline-offset-2",
            invalid
              ? "border-danger focus:border-danger"
              : "border-line-strong focus:border-focus",
            disabled && "bg-subtle cursor-not-allowed",
          )}
        />
      ))}
      {name && <input type="hidden" name={name} value={cells.join("")} />}
    </div>
  );
}

function splitValue(value: string, length: number): string[] {
  const digits = value.replace(/\D/g, "").slice(0, length).split("");
  while (digits.length < length) digits.push("");
  return digits;
}
