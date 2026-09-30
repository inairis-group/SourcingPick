import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/faq")({
  head: () => seoHead("/faq"),
  loader: () => boardHtml("faq"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="faq" source={data.html} sourceVariant={data.variant} />;
}
