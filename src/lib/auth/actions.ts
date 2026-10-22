"use server";

import { AuthError } from "next-auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { writeAuditLog } from "@/lib/audit/log";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { consumeResetToken, issueResetToken } from "@/lib/auth/password-reset";
import { verifyEmailOtp } from "@/lib/auth/otp";
import { sendOtpEmailToUser } from "@/lib/auth/otp-flow";
import { sendEmail } from "@/lib/email/send";
import PasswordResetEmail from "@/lib/email/templates/password-reset";
import { AUTH_PENDING_COOKIE, AUTH_PENDING_TTL_S } from "./pending";
import { pick, type Localized } from "@/lib/i18n/localized";
import { passwordSchema } from "@/lib/auth/password-policy";




// =============================================================
// Login + 2FA
// =============================================================

const LoginSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
  /**
   * The SaaS canvas's "Security" checkbox, checked by default.
   *
   * It can only ever ASK for a one-time code, never skip one: the branch
   * below is `twoFactorEnabled || otp`, so an account that requires the
   * second step still gets it with the box cleared. That asymmetry is the
   * whole design — a control on an unauthenticated form must not be able to
   * weaken the account it names, and this one cannot.
   */
  otp: z.coerce.boolean().default(false),
});

export type LoginActionState = {
  error?: string;
};

/**
 * Login server action. Handles the 2FA branch:
 *  - no code needed  → signs in via Auth.js Credentials, redirects to dashboard
 *  - code needed     → validates password, issues OTP, sets pending cookie,
 *                      redirects to /verify-otp
 *
 * A code is needed when the account has 2FA switched on, or when this
 * particular login asked for one via the form's "Security" checkbox.
 *
 * Generic error messages — never reveal whether email exists.
 */
export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    // An unchecked checkbox sends nothing at all, which coerces to false.
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const locale = await currentLocale();

  // Look up user to determine if 2FA branch is needed
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email, deletedAt: null },
    select: {
      id: true,
      passwordHash: true,
      twoFactorEnabled: true,
      role: true,
    },
  });

  if (!user || !user.passwordHash) {
    await writeAuditLog({
      action: "auth.login_failed",
      payload: { email: parsed.data.email, reason: "no_user_or_oauth_only" },
      level: "WARN",
    });
    return { error: "Invalid email or password." };
  }

  // Either the account always requires a code, or this login asked for one.
  if (user.twoFactorEnabled || parsed.data.otp) {
    // Validate password directly — don't go through Auth.js (that would
    // create a session without the 2FA gate).
    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      await writeAuditLog({
        action: "auth.login_failed",
        targetType: "User",
        targetId: user.id,
        payload: { reason: "bad_password_2fa" },
        level: "WARN",
      });
      return { error: "Invalid email or password." };
    }

    try {
      await sendOtpEmailToUser(user.id);
    } catch (e) {
      await writeAuditLog({
        action: "auth.otp_send_failed",
        targetType: "User",
        targetId: user.id,
        payload: { message: String(e) },
        level: "ALERT",
      });
      return { error: "We couldn't send your verification code. Please try again." };
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_PENDING_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: AUTH_PENDING_TTL_S,
      path: "/",
    });

    await writeAuditLog({
      action: "auth.otp_challenge_issued",
      targetType: "User",
      targetId: user.id,
      // Which of the two reasons put this login behind a code, so the trail
      // shows an account policy apart from a one-off request.
      payload: { reason: user.twoFactorEnabled ? "account_2fa" : "requested" },
    });

    redirect(`/${locale}/verify-otp`);
  }

  // No code needed — sign in via the password Credentials provider
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) {
      await writeAuditLog({
        action: "auth.login_failed",
        targetType: "User",
        targetId: user.id,
        payload: { reason: e.type ?? "unknown" },
        level: "WARN",
      });
      return { error: "Invalid email or password." };
    }
    throw e;
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "auth.login",
    targetType: "User",
    targetId: user.id,
  });

  redirect(dashboardPathForRole(user.role, locale));
}

// =============================================================
// OTP verification (2FA step 2)
// =============================================================

const OtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

export type VerifyOtpState = {
  error?: string;
};

/**
 * OTP verification server action. Reads the pending user ID from the cookie
 * set by loginAction, validates the OTP, then completes sign-in via the
 * credentials-otp provider (which trusts a recently-consumed OTP record).
 */
export async function verifyOtpAction(
  _prev: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const parsed = OtpSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid code." };
  }

  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_PENDING_COOKIE)?.value;
  if (!userId) {
    return { error: "Your session expired. Please sign in again." };
  }

  const result = await verifyEmailOtp(userId, parsed.data.code);
  if (!result.ok) {
    await writeAuditLog({
      action: "auth.otp_verify_failed",
      targetType: "User",
      targetId: userId,
      payload: { reason: result.reason },
      level: "WARN",
    });
    return { error: otpErrorMessage(result.reason) };
  }

  try {
    await signIn("credentials-otp", { userId, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Authentication failed. Please sign in again." };
    }
    throw e;
  }

  cookieStore.delete(AUTH_PENDING_COOKIE);

  await writeAuditLog({
    actorUserId: userId,
    action: "auth.2fa_verified",
    targetType: "User",
    targetId: userId,
  });

  const locale = await currentLocale();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) redirect(`/${locale}/login`);
  redirect(dashboardPathForRole(user.role, locale));
}

export type ResendOtpState = {
  error?: string;
  sent?: boolean;
};

/**
 * Resend OTP — only valid if there's an active pending-auth cookie.
 * Rate-limited implicitly by the cookie's existence (the cookie self-clears
 * after 15 minutes).
 */
export async function resendOtpAction(): Promise<ResendOtpState> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(AUTH_PENDING_COOKIE)?.value;
  if (!userId) {
    return { error: "Your session expired. Please sign in again." };
  }

  try {
    await sendOtpEmailToUser(userId);
  } catch {
    return { error: "We couldn't send a new code. Please try again in a moment." };
  }

  await writeAuditLog({
    action: "auth.otp_resent",
    targetType: "User",
    targetId: userId,
  });

  return { sent: true };
}

function otpErrorMessage(reason: string): string {
  switch (reason) {
    case "no_active_code":
      return "No active code for this session. Try resending.";
    case "expired":
      return "Code expired. Tap Resend to get a new one.";
    case "too_many_attempts":
      return "Too many attempts. Tap Resend to get a new one.";
    case "wrong_code":
    default:
      return "Wrong code. Please try again.";
  }
}

// =============================================================
// Logout
// =============================================================

export async function logoutAction() {
  const locale = await currentLocale();
  await signOut({ redirect: false });
  redirect(`/${locale}/login`);
}

// =============================================================
// Forgot password / reset password
// =============================================================

const ForgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email."),
});

export type ForgotPasswordState = {
  error?: string;
  sent?: boolean;
};

/**
 * Forgot-password action. Always returns `sent: true` on valid input —
 * never reveals whether the email exists (enumeration surface). The email
 * only goes out if a real user matches.
 */
export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = ForgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Please enter a valid email." };

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email, deletedAt: null },
    select: { id: true, locale: true },
  });

  if (user) {
    const { token } = await issueResetToken(parsed.data.email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl}/${user.locale}/reset-password?token=${token}`;
    const subjectByLocale = {
      fr: "Réinitialisez votre mot de passe SourcingPick",
      en: "Reset your SourcingPick password",
      zh: "重置您的 SourcingPick 密码",
      ar: "إعادة تعيين كلمة المرور الخاصة بك في SourcingPick",
    } satisfies Localized<string>;

    try {
      await sendEmail({
        to: parsed.data.email,
        subject: pick(subjectByLocale, user.locale),
        react: PasswordResetEmail({
          resetUrl,
          locale: user.locale,
          expiresInMinutes: 60,
        }),
      });
    } catch (e) {
      await writeAuditLog({
        action: "auth.password_reset_email_failed",
        targetType: "User",
        targetId: user.id,
        payload: { message: String(e) },
        level: "WARN",
      });
    }

    await writeAuditLog({
      action: "auth.password_reset_requested",
      targetType: "User",
      targetId: user.id,
    });
  } else {
    await writeAuditLog({
      action: "auth.password_reset_requested_unknown_email",
      payload: { email: parsed.data.email },
    });
  }

  return { sent: true };
}

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token."),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  });

export type ResetPasswordState = {
  error?: string;
};

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const locale = await currentLocale();
  const result = await consumeResetToken(parsed.data.token);
  if (!result.ok) {
    return {
      error:
        result.reason === "expired"
          ? "This reset link has expired. Request a new one."
          : "This reset link is invalid. Request a new one.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await prisma.user.update({
    where: { email: result.email },
    data: { passwordHash },
    select: { id: true },
  });

  await writeAuditLog({
    action: "auth.password_reset_completed",
    targetType: "User",
    targetId: user.id,
    level: "WARN",
  });

  redirect(`/${locale}/login`);
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
