"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
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
import Image from "next/image";
import { AuthHeading, AuthSubmitIcon } from "../../_design/auth-shell";

const INITIAL: VerifyOtpState = {};

export function OtpForm({ email }: { email: string | null }) {
  const dict = useDictionary();
  const t = dict.auth.verify;
  const [state, formAction, pending] = useActionState(verifyOtpAction, INITIAL);
  const [code, setCode] = useState("");
  const [resending, startResend] = useTransition();
  const [resentNotice, setResentNotice] = useState<string | null>(null);

  // Auto-submit when the user finishes typing the 6 digits.
  //
  // We dispatch the action with an explicit FormData built from `value`
  // instead of calling requestSubmit() on the form. The form serialises
  // the PinInput's hidden <input name="code">, whose value derives from
  // the parent's `code` state — and setCode(value) is async, so the
  // hidden input still holds the previous (stale) digit string at the
  // moment requestSubmit fires. Result: the server rejected the freshly-
  // entered code as "missing" even though the UI showed all six digits.
  const onComplete = (value: string) => {
    setCode(value);
    const fd = new FormData();
    fd.append("code", value);
    // Wrap in startTransition so useActionState's `pending` flips correctly
    // and React doesn't warn ("async function called outside a transition").
    // When formAction is invoked via the form's `action` prop React wraps it
    // automatically — programmatic calls must do it themselves.
    startTransition(() => formAction(fd));
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

  // The canvas writes the address into the sentence. Without a pending
  // cookie there is no address to write, so the generic line stands in
  // rather than a sentence with a hole in it.
  const [before, after] = t.body.split("{email}");
  const body = email ? (
    <>
      {before}
      <strong className="text-fg font-semibold">{email}</strong>
      {after}
    </>
  ) : (
    dict.auth.otp.description
  );

  return (
    <>
      {/* The canvas opens this screen with the envelope rather than the
          wordmark — the only access screen it does that on. */}
      <Image
        src="/design/app/auth-verify-mail.svg"
        alt=""
        width={120}
        height={120}
        priority
        className="size-30 self-start"
      />
      <AuthHeading title={t.title} body={body} />

      <form action={formAction} className="flex flex-col gap-[22px]">
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

        <Field label={t.codeLabel}>
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
          size="lg"
          fullWidth
          loading={pending}
          disabled={code.length !== 6}
          rightIcon={<AuthSubmitIcon />}
        >
          {t.submit}
        </Button>

        {/* Resend on one side, the spam-folder reminder on the other — the
            canvas's own pairing, and the reminder is where it stops people
            asking for a third code. */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-base">
          <button
            type="button"
            onClick={onResend}
            disabled={resending || pending}
            className="text-link hover:text-link-hover disabled:text-disabled font-semibold transition-colors duration-fast"
          >
            {resending ? dict.common.actions.loading : t.resend}
          </button>
          <span className="text-muted">{t.spam}</span>
        </div>
      </form>
    </>
  );
}
