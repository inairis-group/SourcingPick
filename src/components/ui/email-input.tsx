"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

/**
 * Permissive RFC 5321-ish email check — good enough to catch typos
 * (missing @, missing TLD, trailing dot) without rejecting legitimately
 * exotic but valid addresses. Server-side validation in the action remains
 * the source of truth.
 */
const EMAIL_RE =
  /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;

export type EmailInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  inputSize?: "sm" | "md" | "lg";
  /** Localised error message shown when the input loses focus with a bad value. */
  invalidMessage?: string;
};

/**
 * Email input with live "did you mean…" feedback on blur. Sets the native
 * `setCustomValidity` on the underlying input so the browser's form-submit
 * path also catches bad addresses (defence in depth alongside the server
 * Zod schema).
 */
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>(
  function EmailInput(
    { invalidMessage = "Please enter a valid email address.", className, onBlur, onChange, ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const [touched, setTouched] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const value = el.value.trim();
      const valid = value.length === 0 || EMAIL_RE.test(value);
      el.setCustomValidity(valid ? "" : invalidMessage);
      setShowError(touched && !valid && value.length > 0);
    });

    return (
      <div className="flex flex-col gap-1">
        <Input
          ref={innerRef}
          type="email"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          invalid={showError}
          onChange={(e) => {
            if (touched) {
              const value = e.currentTarget.value.trim();
              setShowError(value.length > 0 && !EMAIL_RE.test(value));
            }
            onChange?.(e);
          }}
          onBlur={(e) => {
            setTouched(true);
            const value = e.currentTarget.value.trim();
            setShowError(value.length > 0 && !EMAIL_RE.test(value));
            onBlur?.(e);
          }}
          className={cn(className)}
          {...rest}
        />
        {showError && (
          <p className="text-xs text-danger">{invalidMessage}</p>
        )}
      </div>
    );
  },
);
