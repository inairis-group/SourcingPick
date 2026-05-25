"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { sponsorCertificationAction } from "@/lib/certifications/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

export function SponsorButton({ certificationId }: { certificationId: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const onSponsor = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await sponsorCertificationAction(certificationId);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onSponsor}
        loading={pending}
      >
        {dict.client.certifications.sponsorCta}
      </Button>
      {error && (
        <p className="text-[11px] text-danger max-w-[220px] text-end">
          {error}
        </p>
      )}
    </div>
  );
}
