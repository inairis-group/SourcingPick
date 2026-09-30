import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/application")({
  head: () => seoHead("/application"),
  loader: () => boardHtml("application"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="application" source={data.html} sourceVariant={data.variant} />;
}
