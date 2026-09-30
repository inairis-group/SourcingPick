import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/cookies")({
  head: () => seoHead("/cookies"),
  loader: () => boardHtml("cookies"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="cookies" source={data.html} sourceVariant={data.variant} />;
}
