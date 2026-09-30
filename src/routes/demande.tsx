import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/demande")({
  head: () => seoHead("/demande"),
  loader: () => boardHtml("devis"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="devis" source={data.html} sourceVariant={data.variant} />;
}
