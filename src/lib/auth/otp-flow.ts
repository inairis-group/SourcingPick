import "server-only";
import { Locale } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { issueEmailOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/send";
import OtpEmail from "@/lib/email/templates/otp";

const SUBJECT: Record<Locale, string> = {
  fr: "Votre code de vérification SourcingPick",
  en: "Your SourcingPick verification code",
  zh: "您的 SourcingPick 验证码",
  ar: "رمز التحقق الخاص بك في SourcingPick",
};

/**
 * Issue a fresh email OTP for the user and dispatch it. Returns silently on
 * email failure — caller decides whether to surface that, since most flows
 * shouldn't reveal whether the email send succeeded (enumeration concern).
 */
export async function sendOtpEmailToUser(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, locale: true },
  });

  const { code } = await issueEmailOtp(userId);

  await sendEmail({
    to: user.email,
    subject: SUBJECT[user.locale],
    react: OtpEmail({ code, locale: user.locale, expiresInMinutes: 10 }),
  });
}
