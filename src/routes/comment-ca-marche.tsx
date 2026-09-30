import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/comment-ca-marche")({
  head: () => seoHead("/comment-ca-marche"),
  loader: () => boardHtml("comment"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="comment" source={data.html} sourceVariant={data.variant} />;
}
