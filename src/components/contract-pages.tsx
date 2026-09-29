export function ContractPages({
  number,
  client,
  amount,
  deposit,
  issued,
}: {
  number: string;
  client: string;
  amount: string;
  deposit: string;
  issued: string;
}) {
  const who = client || "le client";
  const pages = [
    {
      kicker: "Page 1 · Parties",
      title: "Contrat de prestation",
      body: [
        `Entre SourcingPick, entrepôt de Guangzhou, et ${who}.`,
        `Le présent contrat accompagne le devis ${number}${issued ? `, émis le ${issued}` : ""}. Il vaut commande dès sa signature électronique.`,
        "SourcingPick réceptionne, contrôle, consolide et expédie les marchandises décrites au devis. Le client reste l’acheteur auprès du fournisseur et l’importateur des marchandises.",
      ],
    },
    {
      kicker: "Page 2 · Prix",
      title: "Prix et acompte",
      body: [
        `Montant du devis : ${amount}. ${deposit && deposit !== "0" ? `Acompte à la signature : ${deposit} %.` : "Aucun acompte n’est prévu à la signature."}`,
        "L’acompte, lorsqu’il existe, est affecté à la commande. Il n’est pas un séquestre. Le solde est facturé selon le devis, avant expédition sauf mention contraire.",
        "Une modification de quantité, de fournisseur ou de destination fait l’objet d’un nouveau devis. Tant qu’il n’est pas signé, l’exécution continue sur la version acceptée.",
      ],
    },
    {
      kicker: "Page 3 · Exécution",
      title: "Réception, contrôle, expédition",
      body: [
        "Les photos d’étape sont versées au dossier. Un écart de quantité, de référence ou d’état est signalé avant consolidation.",
        "Les délais de port et de douane ne sont pas garantis. L’incoterm et le port indiqués au devis priment sur toute formulation générale.",
        "Le client fournit les informations exactes : société, adresse, numéro de TVA le cas échéant, et destinataire de la marchandise.",
      ],
    },
    {
      kicker: "Page 4 · Signature",
      title: "Acceptation",
      body: [
        "La signature électronique identifie le signataire : nom, fonction, société, adresse email vérifiée par code, date, adresse IP et navigateur.",
        "Elle vaut acceptation du devis, de ce contrat et des conditions générales de vente publiées sur sourcingpick.com.",
        "Le document signé est conservé et renvoyé par email. Il peut être téléchargé depuis cette page.",
      ],
    },
  ];
  return (
    <>
      {pages.map((page) => (
        <article key={page.kicker} className="contract-sheet">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-[#155dfc] uppercase">{page.kicker}</p>
          <h2 className="mt-3 text-[28px] leading-tight font-semibold tracking-[-0.03em]">{page.title}</h2>
          <p className="mt-2 text-sm text-[#4a5578]">Devis {number}</p>
          <div className="mt-6 grid gap-4 text-[15.5px] leading-7">
            {page.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}
