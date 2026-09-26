import { SiteLayout } from "@/components/site-layout";

export function LegalPage({ title, raw }: { title: string; raw: string }) {
  const lines = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const mark = lines.findIndex((l) => l.startsWith("Dernière mise à jour"));
  const start = mark > 0 ? mark - 1 : 0;
  const body = lines.slice(start < 0 ? 0 : start);
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        {body.map((line, i) => {
          const heading = line.length < 72 && !/[.。]$/.test(line) && !line.startsWith("Dernière");
          if (i === 0) return <h1 key={i} className="display text-4xl">{line}</h1>;
          if (line.startsWith("Dernière")) return <p key={i} className="mt-2 text-sm text-muted">{line}</p>;
          if (heading) return <h2 key={i} className="mt-8 text-lg font-semibold">{line}</h2>;
          return <p key={i} className="mt-2 text-sm leading-relaxed text-muted">{line}</p>;
        })}
      </article>
    </SiteLayout>
  );
}
