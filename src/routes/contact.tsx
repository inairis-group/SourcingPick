import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/board";
import { seoHead } from "@/lib/seo";
import { boardHtml } from "@/site/board-source";

export const Route = createFileRoute("/contact")({
  head: () => seoHead("/contact"),
  loader: () => boardHtml("contact"),
  component: Page,
});

function Page() {
  const data = Route.useLoaderData();
  return <Board name="contact" source={data.html} sourceVariant={data.variant} />;
}
