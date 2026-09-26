import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useLang } from "@/site/i18n";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "SourcingPick — Guangzhou vers l’Europe" }] }),
  component: Home,
});

const STEPS = [
  ["01", "Réception", "Vos fournisseurs livrent à notre entrepôt de Baiyun. Chaque colis est enregistré : nombre, poids, état."],
  ["02", "Vérification", "Ouverture, comptage et contrôle visuel selon vos consignes. Photos et vidéos dans votre espace client."],
  ["03", "Consolidation", "Plusieurs fournisseurs, un seul envoi. Nous regroupons vos marchandises pour remplir le conteneur."],
  ["04", "Renforcement bois", "Caisses en bois et cerclage pour les produits lourds ou fragiles, avant le chargement."],
  ["05", "Chargement", "Notre équipe charge le conteneur et le photographie, du premier carton à la fermeture des portes."],
  ["06", "Expédition", "Départ du port de Nansha vers l’Europe. Vous suivez le conteneur dans votre espace client."],
];

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-4 sm:grid-cols-3">
        {["Entrepôt de 200 m² · Baiyun, Guangzhou", "4 techniciens sur place", "Société chinoise depuis 2023"].map((s) => (
          <p key={s} className="rounded-2xl border border-line bg-paper px-4 py-3 text-sm font-semibold">
            {s}
          </p>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="display text-3xl">À Guangzhou, pour vous</h2>
        <p className="mt-2 max-w-2xl text-muted">Tout ce qui arrive à vos marchandises entre l’usine et le navire. La France d’abord, puis l’Europe et l’Afrique francophone.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {STEPS.map(([n, title, text]) => (
            <article key={n} className="card">
              <p className="mono text-sm font-semibold text-brand">{n}</p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2">
          <div>
            <p className="mono text-xs font-semibold tracking-wider text-brand uppercase">En option · Sourcing</p>
            <h2 className="display mt-2 text-3xl">Pas encore de fournisseur ? Nos agents le trouvent.</h2>
            <p className="mt-3 text-muted">Recherche, comparaison et négociation auprès des usines. Vous recevez un devis ligne par ligne et vous validez avant toute commande.</p>
            <Link to="/demande" className="btn btn-primary mt-5">Décrire mon besoin</Link>
          </div>
          <div className="rounded-[22px] border border-dashed border-line bg-canvas p-6">
            <p className="mono text-xs font-semibold tracking-wider text-muted uppercase">À l’étude</p>
            <h3 className="mt-2 text-xl font-semibold">Ferroviaire et aérien</h3>
            <p className="mt-2 text-sm text-muted">Pas encore proposés. Nous ne les vendrons qu’une fois testés sur de vrais envois.</p>
          </div>
        </div>
      </section>
      <section id="vrai" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="display text-3xl">On démarre. Alors on vous montre tout.</h2>
        <p className="mt-3 max-w-2xl text-muted">Plutôt que d’afficher des chiffres flatteurs ou des témoignages invérifiables, nous publions ce que vous pouvez contrôler.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <article className="card">
            <h3 className="font-semibold">Vrai aujourd’hui</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Société enregistrée à Guangzhou depuis février 2023</li>
              <li>Entrepôt de 200 m² à Baiyun</li>
              <li>4 techniciens pour recevoir, contrôler et charger</li>
              <li>Départs maritimes depuis le port de Nansha</li>
              <li>Photos de vos marchandises à chaque étape</li>
            </ul>
            <p className="mt-4 text-sm">
              广东省广州市白云区钟落潭镇长腰岭康海北路113号
              <br />
              113 Kanghai Beilu, Changyaoling, Zhongluotan, Baiyun, Guangzhou
            </p>
          </article>
          <article className="card">
            <h3 className="font-semibold">Ce que vous ne verrez pas ici</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Pas de faux avis, ni de logos de clients que nous n’avons pas</li>
              <li>Pas de prix de fret affichés : ils changent chaque semaine</li>
              <li>Pas de délai promis avant d’avoir votre devis</li>
              <li>Pas de train ni d’avion tant que ce n’est pas testé</li>
            </ul>
          </article>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="card flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl">Notre rémunération : 2 % et 3 %</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">2 % sur la marchandise que nous achetons pour vous, 3 % sur le fret que nous refacturons. Aucun frais de dossier. Acompte de 40 %, solde avant chargement.</p>
          </div>
          <Link to="/tarifs" className="btn btn-quiet">Voir les tarifs</Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="rise mx-auto grid max-w-6xl items-end gap-8 px-4 py-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div>
        <p className="mono text-xs font-semibold tracking-wider text-brand uppercase">{t.kicker}</p>
        <h1 className="display mt-3 text-4xl leading-[1.05] sm:text-6xl">
          {t.heroA} <span className="text-brand">{t.heroEm}</span> {t.heroB}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t.lead}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/demande" className="btn btn-primary">{t.quote}</Link>
          <Link to="/comment-ca-marche" className="btn btn-quiet">{t.steps}</Link>
        </div>
        <svg className="mt-8 h-8 w-full max-w-md" viewBox="0 0 320 32" fill="none" aria-hidden="true">
          <path className="route-line" d="M8 16h304" stroke="#155dfc" strokeWidth="2" strokeLinecap="round" />
          <circle cx="8" cy="16" r="5" fill="#0e1a3d" />
          <circle cx="160" cy="16" r="5" fill="#155dfc" />
          <circle cx="312" cy="16" r="5" fill="#ffc247" />
        </svg>
        <p className="mt-1 flex max-w-md justify-between text-xs text-muted"><span>Guangzhou</span><span>Nansha</span><span>Europe</span></p>
      </div>
      <aside className="drift card">
        <p className="text-xs font-semibold text-muted">Exemple · 3 fournisseurs</p>
        <h2 className="mt-1 text-lg font-semibold">Lampes de bureau LED</h2>
        <p className="text-sm text-muted">42 cartons · 1 conteneur 20’</p>
        <ol className="mt-4 space-y-2 text-sm">
          {["Demande reçue", "Devis signé", "Acompte payé", "Contrôle à Guangzhou", "Chargement du conteneur"].map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-ok" />
              {s}
            </li>
          ))}
          <li className="flex items-center gap-2 font-semibold text-brand">
            <span className="size-2 rounded-full bg-brand" />
            En mer vers l’Europe
          </li>
        </ol>
      </aside>
    </section>
  );
}
