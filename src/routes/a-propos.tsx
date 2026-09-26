import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/a-propos")({ component: Page });

function Page() {
  return (
    <SiteLayout>
      <PageIntro title="Une équipe à Guangzhou, au service des importateurs." lead="Nous travaillons là où se joue la qualité d’une importation : entre l’usine et le navire." />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 lg:grid-cols-2">
        <article className="card text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">Notre histoire</h2>
          <p className="mt-2">Sourcing Pick est née à Guangzhou en février 2023 pour aider les acheteurs francophones à travailler avec les usines chinoises.</p>
          <p className="mt-2">En 2026, nous nous recentrons sur ce qui se passe entre l’usine et le navire : réception, contrôle, consolidation, chargement et expédition depuis Nansha.</p>
        </article>
        <article className="card">
          <h2 className="font-semibold">L’équipe</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li><span className="font-semibold">Adam</span> — fondateur et CEO</li>
            <li><span className="font-semibold">Xie Wei</span> — cofondateur</li>
            <li><span className="font-semibold">4 techniciens</span> — réception, contrôle et chargement à Baiyun</li>
          </ul>
        </article>
      </div>
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <Link to="/demande" className="btn btn-primary">Demander un devis</Link>
      </div>
    </SiteLayout>
  );
}
