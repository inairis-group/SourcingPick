"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Input } from "./input";

type Size = "sm" | "md" | "lg";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  inputSize?: Size;
  invalid?: boolean;
  /** Override the show/hide accessible labels (defaults to English). */
  showLabel?: string;
  hideLabel?: string;
};

/**
 * Password input with a show/hide eye toggle. API-compatible with `Input` —
 * just drop in place of `<Input type="password" />`. The toggle button is
 * `type="button"` so it never triggers form submission.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { showLabel = "Show password", hideLabel = "Hide password", ...rest },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? hideLabel : showLabel}
            aria-pressed={visible}
            className="inline-flex items-center justify-center w-7 h-7 -me-1 rounded-sm hover:text-fg focus:outline-2 focus:outline-focus focus:outline-offset-2"
          >
            <HugeiconsIcon
              icon={visible ? ViewOffIcon : ViewIcon}
              size={16}
              strokeWidth={1.5}
            />
          </button>
        }
        {...rest}
      />
    );
  },
);
