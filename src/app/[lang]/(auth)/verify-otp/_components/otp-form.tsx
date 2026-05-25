"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { PinInput } from "@/components/ui/pin-input";
import {
  resendOtpAction,
  verifyOtpAction,
  type VerifyOtpState,
} from "@/lib/auth/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

const INITIAL: VerifyOtpState = {};

export function OtpForm() {
  const dict = useDictionary();
  const [state, formAction, pending] = useActionState(verifyOtpAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const [code, setCode] = useState("");
  const [resending, startResend] = useTransition();
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  // Auto-submit when the user finishes typing the 6 digits.
  const onComplete = (value: string) => {
    setCode(value);
    formRef.current?.requestSubmit();
  };

  // Clear "code resent" notice when user starts typing again.
  useEffect(() => {
    if (resentNotice && code.length > 0) setResentNotice(null);
  }, [code, resentNotice]);

  const onResend = () => {
    setResentNotice(null);
    startResend(async () => {
      const result = await resendOtpAction();
      if (result.error) {
        setResentNotice(`error:${result.error}`);
      } else if (result.sent) {
        setResentNotice("ok:" + dict.auth.otp.resentNotice);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.otp.title}
        </h1>
        <p className="text-sm text-muted">{dict.auth.otp.description}</p>
      </header>

      <form ref={formRef} action={formAction} className="flex flex-col gap-5">
        {state.error && <FormError>{state.error}</FormError>}
        {resentNotice?.startsWith("ok:") && (
          <div
            role="status"
            className="rounded-md border border-success-edge bg-success-soft px-3 py-2 text-sm text-success"
          >
            {resentNotice.slice(3)}
          </div>
        )}
        {resentNotice?.startsWith("error:") && (
          <FormError>{resentNotice.slice(6)}</FormError>
        )}

        <Field label={dict.auth.otp.codeLabel}>
          <div>
            <PinInput
              length={6}
              name="code"
              value={code}
              onChange={setCode}
              onComplete={onComplete}
              disabled={pending}
              autoFocus
              invalid={Boolean(state.error)}
            />
          </div>
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={pending}
          disabled={code.length !== 6}
        >
          {dict.auth.otp.verify}
        </Button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onResend}
            disabled={resending || pending}
            className="text-sm text-link hover:text-link-hover disabled:text-disabled transition-colors duration-fast"
          >
            {resending ? dict.common.actions.loading : dict.auth.otp.resend}
          </button>
        </div>
      </form>
    </div>
  );
}
