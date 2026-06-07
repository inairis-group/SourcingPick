"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { updateOrgSocialUrlsAction } from "@/lib/org/social-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Public-web URLs editor on the settings page. Partner #28 — admin
 * cross-checks these on KYC review to spot mismatches between the
 * registered entity and its public footprint.
 *
 * All four fields are optional. Leaving one blank clears it server-side.
 */
export function SocialSection({
  initial,
}: {
  initial: {
    websiteUrl: string;
    instagramUrl: string;
    facebookUrl: string;
    linkedinUrl: string;
  };
}) {
  const dict = useDictionary();
  const t = dict.settings.social;
  const router = useRouter();
  const [website, setWebsite] = useState(initial.websiteUrl);
  const [instagram, setInstagram] = useState(initial.instagramUrl);
  const [facebook, setFacebook] = useState(initial.facebookUrl);
  const [linkedin, setLinkedin] = useState(initial.linkedinUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [_, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await updateOrgSocialUrlsAction({
        websiteUrl: website.trim(),
        instagramUrl: instagram.trim(),
        facebookUrl: facebook.trim(),
        linkedinUrl: linkedin.trim(),
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <FormError>{error}</FormError>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t.websiteLabel} hint={t.websiteHint}>
          <Input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            maxLength={300}
          />
        </Field>
        <Field label={t.instagramLabel}>
          <Input
            type="url"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/…"
            maxLength={300}
          />
        </Field>
        <Field label={t.facebookLabel}>
          <Input
            type="url"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/…"
            maxLength={300}
          />
        </Field>
        <Field label={t.linkedinLabel}>
          <Input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/company/…"
            maxLength={300}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 mt-1">
        {savedAt && (
          <span className="text-xs text-success">{t.savedMessage}</span>
        )}
        <Button type="submit" variant="primary" size="sm" loading={pending}>
          {t.saveCta}
        </Button>
      </div>
    </form>
  );
}
