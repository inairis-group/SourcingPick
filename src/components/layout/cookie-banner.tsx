"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * RGPD-compliant cookie banner.
 *
 * Shows on every page until the user makes a choice. Choice is persisted in
 * a first-party cookie (`sp_consent`) for 6 months, then asked again.
 *
 * v1 grants/withholds only the "non-essential" bucket as a whole — analytics
 * + future marketing trackers. Essential cookies (locale, session) are not
 * subject to consent under RGPD.
 *
 * Slight mount delay so it doesn't flash on initial paint.
 */

const CONSENT_COOKIE = "sp_consent";
const CONSENT_MAX_AGE_S = 183 * 24 * 60 * 60;

type Consent = "all" | "essential";

function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return value === "all" || value === "essential" ? value : null;
}

function writeConsent(value: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${CONSENT_MAX_AGE_S}; samesite=lax`;
}

export function CookieBanner() {
  const dict = useDictionary();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const accept = () => {
    writeConsent("all");
    setVisible(false);
  };
  const decline = () => {
    writeConsent("essential");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-4 inset-s-4 inset-e-4 z-toast sm:inset-s-auto sm:max-w-md animate-fade-up"
    >
      <div className="rounded-xl border border-line bg-page/90 backdrop-blur-xl shadow-lg p-5">
        <h3
          id="cookie-banner-title"
          className="text-sm font-semibold text-headline mb-1.5"
        >
          {dict.cookies.title}
        </h3>
        <p
          id="cookie-banner-desc"
          className="text-sm text-muted leading-relaxed mb-4"
        >
          {dict.cookies.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" size="sm" onClick={decline} fullWidth>
            {dict.cookies.decline}
          </Button>
          <Button variant="primary" size="sm" onClick={accept} fullWidth>
            {dict.cookies.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
