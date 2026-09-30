import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/tarifs")({
  head: () => seoHead("/tarifs"),
  loader: () => boardHtml("tarifs"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="tarifs" source={data.html} sourceVariant={data.variant} />;
}
