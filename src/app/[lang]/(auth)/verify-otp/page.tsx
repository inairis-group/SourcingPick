import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { OtpForm } from "./_components/otp-form";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { AUTH_PENDING_COOKIE } from "@/lib/auth/pending";
import { prisma } from "@/lib/db/client";

export async function generateMetadata({ params }: PageProps<"/[lang]/verify-otp">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.verify.title };
}

/**
 * Who the code went to.
 *
 * The canvas names the address in the body copy, and it can: whoever is on
 * this screen has already presented that account's password, so the address
 * is theirs and telling them which inbox to open is the whole point of the
 * line. Read from the pending-auth cookie, which is httpOnly and expires in
 * ten minutes; a request without one gets no address and the form says so in
 * general terms rather than failing.
 */
async function pendingEmail(): Promise<string | null> {
  const userId = (await cookies()).get(AUTH_PENDING_COOKIE)?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

export default async function VerifyOtpPage({ params }: PageProps<"/[lang]/verify-otp">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <OtpForm email={await pendingEmail()} />;
}
