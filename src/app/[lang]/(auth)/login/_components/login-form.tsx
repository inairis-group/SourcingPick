"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { EmailInput } from "@/components/ui/email-input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import { loginAction, type LoginActionState } from "@/lib/auth/actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { AuthHeading, AuthSubmitIcon, AuthWordmark } from "../../_design/auth-shell";

const INITIAL: LoginActionState = {};

/**
 * Log in, as the SaaS canvas draws it: heading pair, two 46px fields, the
 * security row, one 17px action, and the line to signup underneath.
 *
 * The canvas draws no Google button, so there is none: Caystone's rule is
 * that anything the canvas does not draw is not a feature. Checked before
 * removing it rather than after — the database holds no linked OAuth account
 * and no user without a password, so this strands nobody. Were that ever
 * untrue, password recovery would still be the way back in, since the reset
 * flow sets a password on an account that has none.
 *
 * The artboard draws the email field pre-filled with a customer's address and
 * the password as a row of bullets. Those are a screenshot of someone using
 * the product, not copy, so the fields ship empty.
 */
export function LoginForm() {
  const dict = useDictionary();
  const t = dict.auth.login;
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <>
      <AuthWordmark href={`/${locale}`} alt={dict.brand.name} />
      <AuthHeading title={t.title} body={t.subtitle} />

      <form action={formAction} className="flex flex-col gap-[22px]">
        {state.error && <FormError>{state.error}</FormError>}

        <Field label={t.emailLabel} required>
          <EmailInput
            name="email"
            inputSize="lg"
            autoComplete="email"
            required
            autoFocus
            invalidMessage={dict.auth.signup.errorEmail}
          />
        </Field>

        <Field label={t.passwordLabel} required>
          <PasswordInput
            name="password"
            inputSize="lg"
            autoComplete="current-password"
            placeholder={t.passwordPlaceholder}
            required
          />
        </Field>

        {/* The canvas puts a checkbox and the recovery link on one line. The
            checkbox is labelled only "Security" there; what it governs is the
            one-time code step, which is the screen the canvas draws next. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox name="otp" defaultChecked label={t.security} title={t.securityHint} />
          <Link
            href={`/${locale}/forgot-password`}
            variant="inline"
            className="text-base font-semibold"
          >
            {t.forgotPassword}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={pending}
          rightIcon={<AuthSubmitIcon />}
        >
          {t.submit}
        </Button>
      </form>

      <p className="text-muted m-0 text-center text-[14.5px]">
        {t.noAccount}{" "}
        <Link href={`/${locale}/signup`} variant="inline" className="font-semibold">
          {t.signupLink}
        </Link>
      </p>
    </>
  );
}
