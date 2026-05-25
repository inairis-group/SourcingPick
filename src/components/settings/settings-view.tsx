import { Role, SubRole } from "@prisma/client";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { TwoFactorToggle } from "./two-factor-toggle";
import { MembersList } from "./members-list";
import { requireAuth } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Composed settings page — shared across all four role surfaces. The page
 * is read once per request; client form components handle their own state.
 *
 * Members section only shows for OWNER sub-role (per spec §2.2 — "Owner
 * peut inviter des membres").
 */
export async function SettingsView({ locale }: { locale: Locale }) {
  const user = await requireAuth();
  const dict = await getDictionary(locale);

  const isOwner = user.subRole === SubRole.OWNER;
  const isAdmin = user.role === Role.ADMIN;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.settings.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.settings.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.settings.description.replace("{org}", user.organization.displayName)}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <Section
          title={dict.settings.profile.title}
          description={dict.settings.profile.description}
        >
          <ProfileForm
            defaultValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
              locale: user.locale,
            }}
          />
        </Section>

        <Section
          title={dict.settings.security.title}
          description={dict.settings.security.description}
        >
          <PasswordForm />
        </Section>

        <Section
          title={dict.settings.twoFactor.title}
          description={dict.settings.twoFactor.description}
        >
          <TwoFactorToggle
            initialEnabled={user.twoFactorEnabled}
            isAdmin={isAdmin}
          />
        </Section>

        {isOwner && (
          <Section
            title={dict.settings.members.title}
            description={dict.settings.members.description}
          >
            <MembersList organizationId={user.organizationId} locale={locale} />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6">
      <header className="flex flex-col gap-1 mb-5">
        <h2 className="text-lg font-semibold text-headline tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted leading-snug">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
