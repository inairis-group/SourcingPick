import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/confidentialite")({
  head: () => seoHead("/confidentialite"),
  loader: () => boardHtml("confidentialite"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="confidentialite" source={data.html} sourceVariant={data.variant} />;
}
