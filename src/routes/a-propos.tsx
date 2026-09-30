import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/a-propos")({
  head: () => seoHead("/a-propos"),
  loader: () => boardHtml("apropos"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="apropos" source={data.html} sourceVariant={data.variant} />;
}
