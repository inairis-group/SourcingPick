import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useAccount } from "@/lib/use-account";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/agent/parametres")({
  head: () => ({ meta: [{ title: "SourcingPick — Paramètres agent" }] }),
  component: Page,
});

function Page() {
  const account = useAccount();
  const { t } = useUi();
  const [mail, setMail] = useState(true);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!account) return;
    setMail(localStorage.getItem(`sp-agent-mail:${account.email}`) !== "0");
  }, [account]);

  return (
    <Shell>
      <PageHead title="Paramètres" />
      <section className="card max-w-xl">
        <h2 className="font-semibold">{account?.name ?? "Agent"}</h2>
        <p className="mt-1 text-sm text-muted">{account?.email}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {t("Les paramètres de la société, l’IBAN et les taux de commission sont réservés à l’administration.")}
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mail}
            onChange={(event) => {
              setMail(event.target.checked);
              setSaved(false);
            }}
          />
          {t("Recevoir les emails de changement d’état et de message client")}
        </label>
        <button
          className="btn btn-primary mt-4"
          type="button"
          onClick={() => {
            if (!account) return;
            localStorage.setItem(`sp-agent-mail:${account.email}`, mail ? "1" : "0");
            setSaved(true);
          }}
        >
          {t("Enregistrer")}
        </button>
        {saved ? <p className="mt-3 text-sm text-[#0e9f6e]">{t("Modifications enregistrées")}</p> : null}
      </section>
    </Shell>
  );
}
