import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/services")({
  head: () => seoHead("/services"),
  loader: () => boardHtml("services"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="services" source={data.html} sourceVariant={data.variant} />;
}
