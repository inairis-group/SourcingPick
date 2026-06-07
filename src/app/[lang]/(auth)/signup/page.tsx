import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ShoppingBag01Icon,
  FactoryIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.auth.signup.title };
}

export default async function SignupPickerPage({
  params,
}: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const choices = [
    {
      key: "client" as const,
      icon: ShoppingBag01Icon,
      title: dict.auth.signup.asClient,
      body: dict.auth.signup.clientBody,
      href: `/${lang}/signup/client`,
    },
    {
      key: "factory" as const,
      icon: FactoryIcon,
      title: dict.auth.signup.asFactory,
      body: dict.auth.signup.factoryBody,
      href: `/${lang}/signup/factory`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 mx-auto w-full max-w-md">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.auth.signup.title}
        </h1>
        <p className="text-sm text-muted">{dict.auth.signup.pickerDescription}</p>
      </header>

      <div className="flex flex-col gap-3">
        {choices.map(({ key, icon, title, body, href }) => (
          <Link
            key={key}
            href={href}
            variant="muted"
            className="group flex items-start gap-4 rounded-lg border border-line bg-surface p-5 hover:border-action transition-colors duration-fast"
          >
            <span className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
              <HugeiconsIcon icon={icon} size={22} strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-headline">{title}</p>
              <p className="mt-1 text-sm text-muted leading-snug">{body}</p>
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={18}
              strokeWidth={1.5}
              className="shrink-0 mt-1 text-faint group-hover:text-action transition-colors duration-fast"
            />
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted text-center">
        {dict.auth.signup.hasAccount}{" "}
        <Link href={`/${lang}/login`} variant="inline" className="text-sm">
          {dict.auth.signup.loginLink}
        </Link>
      </p>
    </div>
  );
}
