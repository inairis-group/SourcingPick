import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/cgv")({
  head: () => seoHead("/cgv"),
  loader: () => boardHtml("cgv"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="cgv" source={data.html} sourceVariant={data.variant} />;
}
