import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/entrepot")({ component: Page });

function Page() {
  return (
    <SiteLayout>
      <PageIntro title="200 m² à Guangzhou, et une adresse que vous pouvez vérifier." lead="C’est ici que vos marchandises sont reçues, contrôlées, consolidées et chargées avant de partir de Nansha." />
      <div className="mx-auto grid max-w-6xl gap-3 px-4 sm:grid-cols-4">
        {[
          ["200 m²", "district de Baiyun"],
          ["4", "techniciens sur place"],
          ["2023", "création de la société"],
          ["Nansha", "port de départ"],
        ].map(([a, b]) => (
          <article key={a} className="card">
            <p className="display text-2xl">{a}</p>
            <p className="text-sm text-muted">{b}</p>
          </article>
        ))}
      </div>
      <section className="mx-auto mt-6 grid max-w-6xl gap-3 px-4 md:grid-cols-2">
        <article className="card text-sm leading-relaxed">
          <h2 className="font-semibold">Adresse</h2>
          <p className="mt-2">广东省广州市白云区钟落潭镇长腰岭康海北路113号</p>
          <p>113 Kanghai Beilu, Changyaoling, Zhongluotan, district de Baiyun, Guangzhou</p>
          <p className="mt-3">Réception 9 h – 23 h, heure de Chine (UTC+8)</p>
          <p>Téléphone +86 195 5817 9800 · WhatsApp</p>
          <p>contact@sourcingpick.com</p>
          <p className="mt-3 text-muted">Carte Amap (高德) : Google Maps n’est pas accessible en Chine.</p>
        </article>
        <article className="card text-sm">
          <h2 className="font-semibold">Faire livrer vos fournisseurs</h2>
          <ol className="mt-3 list-decimal space-y-2 ps-5 text-muted">
            <li>Nous transmettons l’adresse et votre code client.</li>
            <li>Vos fournisseurs inscrivent ce code sur chaque carton.</li>
            <li>Nous photographions chaque livraison dès l’arrivée.</li>
          </ol>
          <p className="mt-4 font-semibold">Ce que nous photographions</p>
          <p className="mt-1 text-muted">Arrivée, cartons ouverts, étiquettes, palettes, caisses, chargement, fermeture des portes.</p>
        </article>
      </section>
    </SiteLayout>
  );
}
