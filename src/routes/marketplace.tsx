import { createFileRoute, Link } from "@tanstack/react-router";
import { CommercePage, money } from "@/components/commerce-public";
import { useOps } from "@/components/ops-ui";
import { publicSales } from "@/lib/commerce.functions";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/marketplace")({
  head: () => seoHead("/marketplace"),
  component: Page,
});

function Page() {
  const { data, error } = useOps(() => publicSales(), "public-sales");
  const items = data ?? [];
  return (
    <CommercePage
      kicker="Vente · Guangzhou"
      title="Marketplace"
      lede="Lots stockés dans notre entrepôt de Guangzhou, décrits tels qu’ils sont. La propriété ne se transfère qu’après encaissement. Le paiement international sera ouvert avec XTransfer."
    >
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      {items.length === 0 ? (
        <Empty title="Aucun lot en vente" text="Les produits mis en ligne depuis l’administration apparaîtront ici." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col rounded-[22px] border border-[#dce3f2] bg-white p-6 shadow-[0_18px_40px_-32px_rgba(14,26,61,0.55)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#155dfc]">{item.sku || "Lot"} · {item.qty} pce</p>
              <h2 className="mt-2 text-[26px] leading-tight font-semibold tracking-[-0.03em]" style={{ fontFamily: "Unbounded, Trebuchet MS, sans-serif" }}>{item.title}</h2>
              <p className="mt-3 flex-1 text-[15.5px] leading-7 text-[#4a5578]">{item.summary}</p>
              <p className="mt-5 text-[28px] font-semibold tracking-tight">{money(item.priceCents)}</p>
              <p className="mt-2 text-sm text-[#4a5578]">Vente ferme. <Link to="/cgv" className="font-semibold text-[#155dfc]">Conditions générales</Link></p>
            </article>
          ))}
        </div>
      )}
    </CommercePage>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[#b7c5e6] bg-white px-6 py-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[#4a5578]">{text}</p>
    </div>
  );
}
